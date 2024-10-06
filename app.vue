<template>
  <main :class="{ dark: darkMode }">
    <Header
      :onFetchResults="fetchResults"
      :onDownloadBook="downloadBook"
      :view="view"
    />
    <div
      id="content"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'drag-over': isDragging }"
    >
      <AdvancedSearch v-if="view === 'search'" :onFetchResults="fetchResults" />
      <Settings v-if="view === 'settings'" />

      <Error
        v-if="view === 'error'"
        :error="error"
        :attemped="lastResult"
        :onRetry="handleClick"
        :onGoBack="() => (view = 'results')"
      />
      <BookView
        v-if="view === 'book'"
        :bookURL="bookURL"
        :downloadProgress="downloadProgress"
        :bookProgress="bookProgress"
        :bookFile="bookFile"
      />
      <BooksList
        :booksList="results"
        :isLoading="isLoading"
        :onBookClick="handleClick"
        v-if="view === 'results'"
      />
      <BooksList
        :booksList="booksList"
        :isLoading="false"
        :onBookClick="handleClick"
        v-if="view === 'history'"
      />
      <div id="welcome" v-if="view === 'welcome'">
        <LucideBookOpenText color="lightgray" />
      </div>
    </div>
    <footer>
      <span>website doesn't use cookies. Your data is saved locally.</span>
    </footer>
  </main>
</template>

<style>
dialog {
  top: 30%;
}
* {
  font-family: sans-serif;
}
body,
html {
  margin: 0;
}
main {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  height: 100dvh;
  background: white;

  &.dark {
    filter: invert(1);
  }
}

#welcome {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  svg {
    width: 50%;
    height: 50%;
  }
}

#content {
  grid-area: 2 / 1 / 3 / 2;
  overflow: scroll;

  &.drag-over {
    border: 10px dashed red;
  }
}
footer {
  text-align: center;
  font-size: 0.75rem;
  color: gray;
  grid-area: 3 / 1 / 4 / 2;
}

@keyframes move-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0; /* Adjust as needed for the speed */
  }
}
</style>

<script setup>
import sanitize from "sanitize-filename";
const appConfig = useAppConfig();
import { createDbWorker } from "sql.js-httpvfs";
import { useLocalStorage } from "@vueuse/core";

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

const defaultColumns = Object.fromEntries(
  ["title", "author", "ext", "lang"].map((x) => [x, x]),
);

const remote = useLocalStorage("remote", null);
const remoteConfig = useLocalStorage("remoteConfig", null);
const ipfsGateway = useLocalStorage("ipfsGateway", "ipfs.io");

const searchQuery = useState("searchQuery", () => "");
const isLoading = useState("isLoading", () => false);
const directLink = useState("directLink", () => "");
const view = useState("view", () => "welcome");
const darkMode = useState("darkMode", () => false);
const bookURL = useState("bookURL", () => "");
const title = useState("title", () => appConfig.title);
const icon = useState("icon", () => appConfig.icon);

const results = ref([]);
const lastResult = ref(null);
const error = ref(null);
const downloadProgress = ref(0);
const bookFile = ref(null);
const isDragging = ref(false);
const bookProgress = ref(0);
const booksList = computed(() => {
  return view.value === "history"
    ? JSON.parse(localStorage.getItem("history") || "[]")
    : results;
});

const setResults = (books) => {
  const { images, columns } = JSON.parse(remoteConfig.value);
  results.value = books.map((b) => {
    for (const key of Object.keys(columns)) {
      b[key] = b[columns[key]];
      delete b[columns[key]];
    }
    b.image_url = images
      .replaceAll("${id}", b.id)
      .replaceAll("${md5}", b.md5)
      .replaceAll("${ipfs_cid}", b.ipfs_cid)
      .replaceAll("${id_group}", Math.floor(b.id / 1000) * 1000);
    return b;
  });
};
const downloadBook = () => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(bookFile.value);
  const b = lastResult.value;
  link.href = url;
  link.download = sanitize(`${b.Author} - ${b.Title}.${b.Extension}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Release the URL object
};

const handleDrop = (event) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    bookFile.value = files[0];
    view.value = "book";
    isDragging.value = false;
  }
};

const fetchResults = async (query) => {
  if (!remote.value) {
    console.log("you have to choose a remote");
    view.value = "settings";
    return;
  }
  let complexSearch = false;
  if (view === "search") {
    complexSearch.value = true;
    searchQuery.value = "";
  }

  view.value = "results";

  isLoading.value = true;
  results.value = [];
  let dbResult = [];

  let maxBytesToRead = 10 * 1024 * 1024;

  const {
    dbConfig,
    tableName = "updated_data",
    columns = defaultColumns,
  } = JSON.parse(remoteConfig.value);

  try {
    console.log("Connecting to the database...");
    const worker = await createDbWorker(
      [
        {
          from: "inline",
          config: dbConfig,
        },
      ],
      workerUrl.toString(),
      wasmUrl.toString(),
      maxBytesToRead, // optional, defaults to Infinity
    );

    console.log("Making the query...");
    if (query.length > 3) {
      dbResult = await worker.db.exec(
        `SELECT * FROM ${tableName}
          WHERE id IN (
          SELECT rowid FROM ${tableName}_fts
          WHERE ${tableName}_fts MATCH ? )
          LIMIT 10;`,
        [`${columns.title}:${query}* OR ${columns.author}:${query}*`],
      );
    } else {
      const params = [];
      if (query.title && query.author)
        params.push(
          `${columns.title}:${query.title} AND ${columns.author}:${query.author}`,
        );
      else if (query.author) params.push(`${columns.author}:${query.author}`);
      else params.push(`${columns.title}:${query.title}`); // we must have either title or author

      if (query.lang) params.push(query.lang);
      if (query.ext) params.push(query.ext);
      dbResult = await worker.db.exec(
        `
          SELECT ${tableName}.* FROM ${tableName}
          JOIN ${tableName}_fts ON ${tableName}.id = ${tableName}_fts.rowid
          WHERE ${tableName}_fts MATCH ?
          ${query.lang ? ` AND ${columns.lang} = ? ` : ""}
          ${query.ext ? ` AND ${columns.ext} = ? ` : ""}
          LIMIT 10;`,
        params,
      );
    }

    console.log("Gathering results...");
    setResults(
      dbResult[0].values.map((line) =>
        Object.assign(
          {},
          ...dbResult[0].columns.map((n, index) => ({ [n]: line[index] })),
        ),
      ),
    );
  } catch (e) {
    console.error("Error while searching: ", e);
  } finally {
    isLoading.value = false;
  }
};

const getBookURL = (result, filename) =>
  appConfig.ipfsGateways[ipfsGateway.value].url
    .replaceAll("${cid}", result.ipfs_cid)
    .replaceAll("${filename}", filename);

const handleClick = async (result) => {
  lastResult.value = result;
  view.value = "book";
  const previousHistory = JSON.parse(localStorage.getItem("history") || "[]");
  const updatedHistory = [result, ...previousHistory];
  if (!previousHistory.find((x) => x.id === result.id)) {
    localStorage.setItem("history", JSON.stringify(updatedHistory));
  }
  console.log("Selected result:", result.title, result.id);
  isLoading.value = true;
  error.value = null;
  bookFile.value = null;
  downloadProgress.value = 0;

  const filename = sanitize(`${result.author} - ${result.title}.${result.ext}`);

  directLink.value = false;
  bookURL.value = getBookURL(result, filename);

  try {
    const response = await fetch(bookURL.value);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const contentLength = result.Filesize;

    let receivedLength = 0;
    let chunks = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      isLoading.value = false;
      receivedLength += value.length;
      downloadProgress.value = (receivedLength / contentLength) * 100;
    }

    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    const { fraction } = updatedHistory.find((b) =>
      bookURL.value.includes(result.ipfs_cid),
    );
    bookProgress.value = fraction;

    // Create a Blob from the Uint8Array
    const blob = new Blob([chunksAll], {
      type: response.headers.get("content-type"),
    });

    // Create a File object from the Blob
    // bookFile.value = new File([blob], filename, {
    bookFile.value = new File([blob], "blabla.epub", {
      type: response.headers.get("content-type"),
      lastModified: new Date().getTime(),
    });

    console.log("Download completed");
  } catch (error) {
    console.error("Download failed:", error);
    view.value = "error";
    error.value = error;
  } finally {
    isLoading.value = false;
  }
};
</script>
