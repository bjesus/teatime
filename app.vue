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
      @scroll="fetchMoreBooks"
      :class="{ 'drag-over': isDragging }"
    >
      <AdvancedSearch v-if="view === 'search'" :onFetchResults="fetchResults" />
      <Settings v-if="view === 'settings'" :onFetchResults="fetchResults" />
      <Instances v-if="view === 'instances'" />

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
        :paginate="true"
        :onFetchMoreBooks="fetchMoreBooks"
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
      {{ title }} is an instance of
      <a href="https://github.com/teatime-library/teatime" target="_blank"
        >TeaTime</a
      >, a distributed, static, cookie-less system for reading books over IPFS.
      There are also
      <a href="#" @click="() => (view = 'instances')">other instances</a>.
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
</style>

<style scoped>
main {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  height: 100dvh;
  background: white;

  &.dark {
    filter: invert(1) hue-rotate(180deg);
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
  overflow: auto;

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
</style>

<script setup lang="ts">
import sanitize from "sanitize-filename";
const appConfig = useAppConfig();
import { createDbWorker } from "sql.js-httpvfs";
import { useLocalStorage } from "@vueuse/core";
import { getFile, saveFile } from "./indexdb";
import { Liquid } from "liquidjs";
const liquid = new Liquid();

useHead({
  title: appConfig.title,
  link: [
    {
      rel: "icon",
      href:
        "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>" +
        appConfig.icon +
        "</text></svg>",
    },
  ],
});

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

const defaultColumns = Object.fromEntries(
  ["title", "author", "ext", "lang"].map((x) => [x, x]),
);

const remote = useLocalStorage("remote", null);
const lastQuery = useLocalStorage("lastQuery", null);
const remoteConfig = useLocalStorage("remoteConfig", null);
const ipfsGateway = useLocalStorage("ipfsGateway", "ipfs.io");

const searchQuery = useState("searchQuery", () => "");
const offset = useState("offset", () => 0);
const isLoading = useState("isLoading", () => false);
const directLink = useState("directLink", () => false);
const view = useState("view", () => "welcome");
const darkMode = useState("darkMode", () => false);
const bookURL = useState("bookURL", () => "");
const title = useState("title", () => appConfig.title);
const icon = useState("icon", () => appConfig.icon);
const moreResults = useState("moreResults", () => false);

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

onMounted(async () => {
  if (!remoteConfig.value) {
    view.value = "settings";
  } else {
    fetchResults("", true);
  }
});

const setResults = (books, append) => {
  const { images = "", columns = {} } = JSON.parse(remoteConfig.value);
  results.value = [
    ...(append ? results.value : []),
    ...books.map((b) => {
      for (const key of Object.keys(columns)) {
        b[key] = b[columns[key]];
        delete b[columns[key]];
      }
      b.image_url = liquid.parseAndRenderSync(images, b);
      return b;
    }),
  ];
};
const downloadBook = () => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(bookFile.value);
  const b = lastResult.value;
  link.href = url;
  link.download = sanitize(`${b.author} - ${b.title}.${b.ext}`);
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

const fetchResults = async (query, reset, setRemote) => {
  console.log("Running query", query, setRemote);
  lastQuery.value = JSON.stringify(query);
  if (setRemote) {
    const [owner, repo] = setRemote.split("/");
    const response = await fetch(
      `https://${owner}.github.io/${repo}/config.json`,
    );
    const config = await response.json();
    remoteConfig.value = JSON.stringify(config);
    remote.value = setRemote;
    offset.value = 0;
  }
  if (reset) offset.value = 0;
  if (!remote.value) {
    console.log("you have to choose a remote");
    view.value = "settings";
    return;
  }
  if (view === "search") {
    searchQuery.value = "";
  }

  view.value = "results";

  isLoading.value = true;
  if (!offset.value) results.value = [];
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

    const perPage = 5;
    const limitOffset = `LIMIT ${perPage * offset.value}, ${perPage}`;

    console.log("Making the query...");
    if (typeof query === "string") {
      if (query) {
        dbResult = await worker.db.exec(
          `SELECT * FROM ${tableName}
          WHERE id IN (
            SELECT rowid FROM ${tableName}_fts
            WHERE ${tableName}_fts MATCH ?
            ${limitOffset}
          );`,
          [`${columns.title}:${query}* OR ${columns.author}:${query}*`],
        );
      } else {
        dbResult = await worker.db.exec(
          `SELECT * FROM ${tableName}
            ${limitOffset}
          ;`,
          [],
        );
      }
    } else {
      const whereQueries = [];
      const params = [];
      if (query.title && query.author) {
        whereQueries.push(`${tableName}_fts MATCH ?`);
        params.push(
          `${columns.title}:${query.title} AND ${columns.author}:${query.author}`,
        );
      } else if (query.author) {
        whereQueries.push(`${tableName}_fts MATCH ?`);
        params.push(`${columns.author}:${query.author}`);
      } else if (query.title) {
        whereQueries.push(`${tableName}_fts MATCH ?`);
        params.push(`${columns.title}:${query.title}`);
      }

      if (query.lang) {
        whereQueries.push(columns.lang + " = ?");
        params.push(query.lang);
      }
      if (query.ext) {
        whereQueries.push(columns.ext + " = ?");
        params.push(query.ext);
      }
      const where = params.join(" AND ");
      const sqlQuery = `
          SELECT ${tableName}.* FROM ${tableName}
          JOIN ${tableName}_fts ON ${tableName}.id = ${tableName}_fts.rowid
          WHERE ${whereQueries.join(" AND ")}
          ${limitOffset};`;
      dbResult = await worker.db.exec(sqlQuery, params);
    }

    console.log("Gathering results...");
    console.log(dbResult);
    setResults(
      dbResult[0].values.map((line) =>
        Object.assign(
          {},
          ...dbResult[0].columns.map((n, index) => ({ [n]: line[index] })),
        ),
      ),
      !!offset.value,
    );
  } catch (e) {
    console.error("Error while searching: ", e);
  } finally {
    isLoading.value = false;
  }

  if (dbResult[0].values.length) {
    moreResults.value = true;
  } else {
    moreResults.value = false;
  }

  fetchMoreBooks();
};

const fetchMoreBooks = () => {
  const obj = document.querySelector("#content");

  if (
    (obj.scrollTopMax === 0 || // There's no scroll
      obj.scrollTop + 1 >= obj.scrollHeight - obj.offsetHeight) && // We're at the bottom
    !isLoading.value &&
    view.value === "results" &&
    moreResults.value
  ) {
    offset.value++;
    fetchResults(JSON.parse(lastQuery.value));
  }
};

const downloadUrls = (urls: string[], contentLength: number): Promise<Blob> => {
  const controller = new AbortController();
  const signal = controller.signal;

  const downloads = urls.map((url) =>
    fetch(url, { signal }).then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      return {
        read: async function () {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            chunks.push(value);
            receivedLength += value.length;
            const progress = (receivedLength / contentLength) * 100;
            if (progress > downloadProgress.value) {
              downloadProgress.value = progress;
            }

            if (downloadProgress.value >= 100) {
              controller.abort();
              break;
            }
          }

          return new Blob(chunks, {
            type:
              response.headers.get("content-type") ||
              "application/octet-stream",
          });
        },
        contentType:
          response.headers.get("content-type") || "application/octet-stream",
      };
    }),
  );

  return new Promise((resolve, reject) => {
    let completedDownloads = 0;
    let failedDownloads = 0;

    downloads.forEach(async (download) => {
      try {
        const { read, contentType } = await download;
        const blob = await read();
        resolve(new Blob([blob], { type: contentType }));
        controller.abort(); // Cancel other ongoing downloads
      } catch (error) {
        failedDownloads++;
        if (failedDownloads === urls.length) {
          reject(new Error("All downloads failed"));
        }
      } finally {
        completedDownloads++;
        if (
          completedDownloads === urls.length &&
          failedDownloads === urls.length
        ) {
          reject(new Error("All downloads failed"));
        }
      }
    });
  });
};

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

  const filename = sanitize(
    `${result.author} - ${result.title}.${result.ext}`.trim(),
  );

  try {
    const urls = [
      "https://ipfs.io",
      "https://flk-ipfs.xyz",
      "https://ipfs.cyou",
      "https://storry.tv",
      "https://dweb.link",
      "https://gateway.pinata.cloud",
      "https://ipfs.runfission.com",
      "https://nftstorage.link",
      "https://4everland.io",
      "https://w3s.link",
      "http://localhost:8080",
    ].map((u) => `${u}/ipfs/${result.ipfs_cid}`);

    bookURL.value = urls[0];

    const retrievedFile = await getFile(result.ipfs_cid);
    if (retrievedFile) {
      console.log("Got file from IndexDB");
      bookFile.value = retrievedFile;
    } else {
      const blob = await downloadUrls(urls, result.size);
      bookFile.value = new File([blob], filename, {
        type: blob.type,
        lastModified: new Date().getTime(),
      });
      console.log("Download completed");
      await saveFile(bookFile.value, result.ipfs_cid);
    }
    const { fraction } = updatedHistory.find((b) =>
      bookURL.value.includes(result.ipfs_cid),
    );
    bookProgress.value = fraction;
  } catch (error) {
    console.error("Download failed:", error);
    view.value = "error";
    error.value = error;
    return;
  } finally {
    isLoading.value = false;
  }
};
</script>
