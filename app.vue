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
import appConfig from "./teatime.config.ts";
import { createDbWorker } from "sql.js-httpvfs";
const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

const config = {
  from: "inline",
  config: appConfig.dbConfig,
};

const remote = useState("remote", () => "");
const searchQuery = useState("searchQuery", () => "");
const isLoading = useState("isLoading", () => false);
const directLink = useState("directLink", () => "");
const results = useState("results", () => []);
const view = useState("view", () => "welcome");
const darkMode = useState("darkMode", () => false);
const bookURL = useState("bookURL", () => "");
const lastResult = useState("lastResult", () => null);
const error = useState("error", () => null);
const downloadProgress = useState("downloadProgress", () => 0);
const bookFile = ref(null);
const isDragging = useState("isDragging", () => false);
const title = useState("title", () => appConfig.title);
const icon = useState("icon", () => appConfig.icon);

const booksList = computed(() => {
  return view.value === "history"
    ? JSON.parse(localStorage.getItem("history") || "[]")
    : results;
});

const setResults = (r) => {
  // const updatedResults = await Promise.all(
  //   results.map(async (r) => ({
  //     ...r,
  //     Coverurl: await appConfig.getImageURL(r),
  //   })),
  // );
  results.value = r;
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
  // if (remote.value === "") {
  //   console.log("you have to choose a remote");
  //   return;
  // }
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

  try {
    const worker = await createDbWorker(
      [config],
      workerUrl.toString(),
      wasmUrl.toString(),
      maxBytesToRead, // optional, defaults to Infinity
    );

    if (query.length > 3) {
      dbResult = await worker.db.exec(
        `SELECT * FROM updated_data
          WHERE id IN (
          SELECT rowid FROM updated_data_fts
          WHERE updated_data_fts MATCH ? )
          LIMIT 10;`,
        [`Title:${query}* OR Author:${query}*`],
      );
    } else {
      const params = [];
      if (query.title && query.author)
        params.push(`Title:${query.title} AND Author:${query.author}`);
      else if (query.author) params.push(`Author:${query.author}`);
      else params.push(`Title:${query.title}`); // we must have either title or author

      if (query.lang) params.push(query.lang);
      if (query.ext) params.push(query.ext);
      dbResult = await worker.db.exec(
        `
          SELECT updated_data.* FROM updated_data
          JOIN updated_data_fts ON updated_data.id = updated_data_fts.rowid
          WHERE updated_data_fts MATCH ?
          ${query.lang ? " AND Language = ? " : ""}
          ${query.ext ? " AND Extension = ? " : ""}
          LIMIT 10;`,
        params,
      );
    }

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

const handleClick = async (result) => {
  lastResult.value = result;
  view.value = "book";
  const previousHistory = JSON.parse(localStorage.getItem("history") || "[]");
  if (!previousHistory.find((x) => x.id === result.id)) {
    localStorage.setItem(
      "history",
      JSON.stringify([result, ...previousHistory]),
    );
  }
  console.log("Selected result:", result.Title, result.id);
  isLoading.value = true;
  error.value = null;
  bookFile.value = null;
  downloadProgress.value = 0;

  const filename = sanitize(
    `${result.Author} - ${result.Title}.${result.Extension}`,
  );

  directLink.value = appConfig.getDirectLink(result, filename);
  bookURL.value = appConfig.getBookURL(result, filename);

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
