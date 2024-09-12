<template>
  <main :class="{ dark: darkMode }">
    <header class="loading">
      <h1 @click="view = 'results'">{{ icon }} {{ title }}</h1>
      <div id="options">
        <p>
          <a
            v-if="view === 'book' && bookFile"
            @click="download"
            title="Download book"
          >
            <LucideDownload />
          </a>
          <a
            v-if="view === 'book'"
            @click="setFullScreen"
            title="Go full screen"
          >
            <LucideExpand />
          </a>
          <a @click="view = 'history'" title="History">
            <LucideHistory />
          </a>
          <a
            title="Back to book"
            v-if="view !== 'book' && bookFile"
            @click="view = 'book'"
          >
            <LucideBookOpen />
          </a>
          <a @click="view = 'search'" title="Advanced search"
            ><LucideSearch
          /></a>
          <a @click="darkMode = !darkMode" title="Toggle dark mode">
            <LucideSun
          /></a>
        </p>
      </div>
      <div class="search">
        <input
          v-if="view !== 'search'"
          type="search"
          v-model.trim="searchQuery"
          @keyup.enter="fetchResults"
          placeholder="What would you like to read today?"
          autofocus
        />
      </div>

      <div class="loader" :class="{ loading: isLoading }"></div>
    </header>
    <div
      id="content"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'drag-over': isDragging }"
    >
      <div v-if="view === 'error'" class="error">
        <h3>houston we have a problem 😵</h3>
        <code>
          {{ error }}
        </code>
        <br />
        <p v-if="directLink">
          You can try
          <a target="_blank" :href="directLink"
            >downloading the file directly</a
          >
          and then drag-n-drop it here
        </p>
        <br />
        <button @click="handleClick(lastResult)">Try again</button>
        <button @click="view = 'results'">Back to results</button>
      </div>
      <div id="complex-search" v-if="view === 'search'">
        <div>
          <label
            >Book title
            <input v-model.trim="csTitle" />
          </label>
        </div>
        <div>
          <label
            >Author
            <input v-model.trim="csAuthor" />
          </label>
        </div>
        <div class="selectors">
          <label
            >Format
            <select v-model="csExt">
              <option value="">Any format</option>
              <option value="epub">ePub</option>
              <option value="pdf">PDF</option>
              <option value="mobi">MOBI</option>
            </select>
          </label>
          <label
            >Language
            <select v-model="csLang">
              <option value="">Language</option>
              <option value="Arabic">Arabic</option>
              <option value="Belarusian">Belarusian</option>
              <option value="Bengali">Bengali</option>
              <option value="Bulgarian">Bulgarian</option>
              <option value="Castilian">Castilian</option>
              <option value="Catalan">Catalan</option>
              <option value="Chinese">Chinese</option>
              <option value="Croatian">Croatian</option>
              <option value="Czech">Czech</option>
              <option value="Danish">Danish</option>
              <option value="Dutch">Dutch</option>
              <option value="English">English</option>
              <option value="Flemish">Flemish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Greek">Greek</option>
              <option value="Hebrew">Hebrew</option>
              <option value="Hindi">Hindi</option>
              <option value="Hungarian">Hungarian</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Kazakh">Kazakh</option>
              <option value="Korean">Korean</option>
              <option value="Latin">Latin</option>
              <option value="Lithuanian">Lithuanian</option>
              <option value="Norwegian">Norwegian</option>
              <option value="Persian">Persian</option>
              <option value="Polish">Polish</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Romanian">Romanian</option>
              <option value="Russian">Russian</option>
              <option value="Serbian">Serbian</option>
              <option value="Spanish">Spanish</option>
              <option value="Swedish">Swedish</option>
              <option value="Tamil">Tamil</option>
              <option value="Thai">Thai</option>
              <option value="Turkish">Turkish</option>
              <option value="Ukrainian">Ukrainian</option>
              <option value="Urdu">Urdu</option>
              <option value="Vietnamese">Vietnamese</option>
            </select>
          </label>
        </div>
        <button @click="fetchResults">Advanced Search</button>
      </div>
      <template v-if="view === 'book'">
        <div v-if="bookURL && !bookFile" id="downloadStatus">
          <p>
            <span v-if="downloadProgress > 0">Downloading</span
            ><span v-else>Connecting to</span> {{ bookURL }}
          </p>
          <progress v-if="downloadProgress" max="100" :value="downloadProgress">
            {{ downloadProgress }}%
          </progress>
        </div>
        <article v-if="bookFile">
          <ClientOnly>
            <component
              :is="VueReader"
              v-if="VueReader"
              :url="bookFile"
              style="height: 100%"
              :getRendition="getRendition"
            />
          </ClientOnly>
        </article>
      </template>
      <div id="results" v-if="view === 'results' || view === 'history'">
        <ul v-if="booksList.length">
          <li
            v-for="(result, index) in booksList"
            :key="index"
            @click="handleClick(result)"
          >
            <img
              v-if="result.Coverurl"
              :src="result.Coverurl"
              referrerpolicy="no-referrer"
            />
            <div>
              <h2 :title="result.Title">{{ result.Title }}</h2>
              <h3>{{ result.Author }}, {{ result.Year }}</h3>
              <span class="ext"
                ><LucideFile :size="12" /> {{ result.Extension }}</span
              >
              <span class="ext"
                ><LucideLanguages :size="12" />{{ result.Language }}</span
              >
              <span class="ext"
                ><LucideArrowBigDownDash :size="12" />
                {{ prettyBytes(result.Filesize) }}</span
              >
            </div>
          </li>
        </ul>
        <p v-else-if="isLoading">Searching...</p>
        <p v-else>No results</p>
      </div>
      <div id="welcome" v-if="view === 'welcome'">
        <LucideBookOpenText color="lightgray" />
      </div>
    </div>
    <footer>
      <span>This website doesn't use cookies. Your data is saved locally.</span>
    </footer>
  </main>
</template>

<style>
* {
  font-family: sans-serif;
}
body {
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

  #results {
    > p {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-weight: bold;
      color: lightgray;
    }
  }

  #complex-search {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    & > div {
      margin-bottom: 1rem;
    }
    label {
      display: block;
    }

    input {
      width: 100%;
      @media (min-width: 600px) {
        width: 40rem;
      }
    }
    .selectors {
      display: flex;
      width: 100%;
      @media (min-width: 600px) {
        width: 40rem;
      }
      justify-content: space-evenly;
    }

    input,
    select,
    button {
      border-radius: 1rem;
      display: block;
      padding: 0.5rem;
      border: 1px solid lightgray;
    }
  }

  .error {
    text-align: center;
    code {
      font-family: monospace;
      background: black;
      color: green;
      padding: 1rem;
      margin: 1rem;
    }
    p {
      margin-top: 2rem;
    }
    button {
      margin-top: 4rem;
      border-radius: 1rem;
      border: 1px solid gray;
      padding: 0.5rem 1rem;
      margin-right: 1rem;
      height: 100%;
    }
  }

  #downloadStatus {
    p {
      margin: 0 1rem;
      color: gray;
      font-size: 0.7rem;
    }
    progress {
      border-radius: 0;
      width: 100%;
    }
  }

  article {
    height: 100%;
  }
}
footer {
  text-align: center;
  font-size: 0.75rem;
  color: gray;
  grid-area: 3 / 1 / 4 / 2;
}
span.ext {
  background: #ebebeb;
  font-size: 0.8rem;
  border-radius: 1rem;
  padding: 0 0.5rem;
  margin-right: 1rem;
  text-wrap: nowrap;

  svg {
    margin-right: 0.3rem;
  }
}
@keyframes move-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0; /* Adjust as needed for the speed */
  }
}

header {
  padding: 8px;
  grid-area: 1 / 1 / 2 / 2;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 1fr 1fr auto;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  margin-bottom: 1rem;
  grid-template-areas:
    "logo options"
    "search search"
    "loader loader";

  @media (min-width: 600px) {
    grid-template-columns: 1fr 45rem 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas:
      "logo search options"
      ". loader .";
  }

  #options {
    grid-area: options;
    margin: 0;
    text-align: right;
    padding: 0 0.5rem 0 0;

    svg {
      margin-left: 1rem;
      cursor: pointer;
    }

    button {
      border-radius: 1rem;
      border: 1px solid gray;
      @media (min-width: 600px) {
        padding: 1rem;
        height: 100%;
      }
    }
  }

  h1 {
    grid-area: logo;
    margin: 0;
    cursor: pointer;

    &:hover {
      font-style: italic;
    }
  }
  .search {
    grid-area: search;

    input {
      flex-grow: 1;
      box-shadow: 2px 2px 0.3rem #eee;
      border: 1px solid gray;
      padding: 1rem;
      width: 100%;
      border-radius: 1rem;
      box-sizing: border-box;
    }
  }

  .loader {
    grid-area: loader;
    margin: 0 1rem;
    height: 5px;
    &.loading {
      background: repeating-linear-gradient(
        45deg,
        #606dbc,
        #606dbc 10px,
        #465298 10px,
        #465298 20px
      );
      background-size: 40px 40px; /* Adjust as needed */
      animation: move-stripes 1s linear infinite;
    }
  }
}
ul {
  margin: auto;
  padding: 0;
  max-width: 45rem;

  li {
    display: flex;
    padding: 1rem;
    img {
      width: 4.5rem;
      margin-right: 1rem;
      object-fit: cover;
      height: 8.5rem;
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
      @media (min-width: 600px) {
        font-size: 1.5rem;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0;
        overflow: hidden;
        width: 35rem;
      }
    }

    h3 {
      font-size: 1rem;
      @media (min-width: 600px) {
        font-size: 1.2rem;
      }
    }
    list-style-type: none;
    border: 1px solid lightgrey;
    box-shadow: 2px 2px 0.3rem #eee;
    border-radius: 1rem;
    margin-bottom: 1rem;

    &:hover {
      background: rgba(245, 245, 245);
      cursor: pointer;
    }
  }
}

button.arrow {
  color: black;
}

.tocButtonBar {
  background: black;
}
</style>

<script setup>
import { ref, onMounted } from "vue";

const VueReader = ref(null);

onMounted(async () => {
  const module = await import("vue-book-reader");
  VueReader.value = module.VueReader;
});
</script>

<script>
const getCSS = (style) => [
  `
    html, body {
      background: #fff;
      color: #000;
    }
  `,
];

import prettyBytes from "pretty-bytes";
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

let maxBytesToRead = 10 * 1024 * 1024;
const worker = await createDbWorker(
  [config],
  workerUrl.toString(),
  wasmUrl.toString(),
  maxBytesToRead, // optional, defaults to Infinity
);

export default {
  data() {
    return {
      searchQuery: "",
      isLoading: false,
      directLink: "",
      results: [],
      view: "welcome",
      darkMode: false,
      bookURL: "",
      lastResult: null,
      error: null,
      downloadProgress: 0,
      bookFile: null,
      isDragging: false,
      csTitle: "",
      csAuthor: "",
      csExt: "",
      csLang: "",
      title: appConfig.title,
      icon: appConfig.icon,
    };
  },
  computed: {
    booksList() {
      return this.view === "history"
        ? JSON.parse(localStorage.getItem("history") || "[]")
        : this.results;
    },
  },
  methods: {
    async setResults(results) {
      for (const r of results) {
        r.Coverurl = await appConfig.getImageURL(r);
      }
      this.results = results;
    },
    download() {
      const link = document.createElement("a");
      const url = URL.createObjectURL(this.bookFile);
      const b = this.lastResult;
      link.href = url;
      link.download = sanitize(`${b.Author} - ${b.Title}.${b.Extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Release the URL object
    },
    setFullScreen() {
      const content = document.getElementById("content");
      content.requestFullscreen();
    },
    handleDrop(event) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.bookFile = files[0];
        this.view = "book";
        this.isDragging = false;
      }
    },
    async fetchResults() {
      let complexSearch = false;
      if (this.view === "search") {
        complexSearch = true;
        this.searchQuery = "";
      }

      this.view = "results";

      this.isLoading = true;
      this.results = [];
      let dbResult = [];
      if (this.searchQuery.length > 3) {
        dbResult = await worker.db.exec(
          `
          SELECT * FROM updated_data
          WHERE id IN (
          SELECT rowid FROM updated_data_fts
          WHERE updated_data_fts MATCH ? )
          LIMIT 10;`,
          [`Title:${this.searchQuery}* OR Author:${this.searchQuery}*`],
        );
      } else {
        const params = [];
        if (this.csTitle && this.csAuthor)
          params.push(`Title:${this.csTitle} AND Author:${this.csAuthor}`);
        else if (this.csAuthor) params.push(`Author:${this.csAuthor}`);
        else params.push(`Title:${this.csTitle}`); // we must have either title or author

        if (this.csLang) params.push(this.csLang);
        if (this.csExt) params.push(this.csExt);
        dbResult = await worker.db.exec(
          `
          SELECT updated_data.* FROM updated_data
          JOIN updated_data_fts ON updated_data.id = updated_data_fts.rowid
          WHERE updated_data_fts MATCH ?
          ${this.csLang ? " AND Language = ? " : ""}
          ${this.csExt ? " AND Extension = ? " : ""}
          LIMIT 10;`,
          params,
        );
      }

      this.setResults(
        dbResult[0].values.map((line) =>
          Object.assign(
            {},
            ...dbResult[0].columns.map((n, index) => ({ [n]: line[index] })),
          ),
        ),
      );

      this.isLoading = false;
    },

    async getRendition(rendition) {
      const { book, renderer } = rendition;
      renderer.setStyles(getCSS());
    },

    async handleClick(result) {
      this.lastResult = result;
      this.view = "book";
      const previousHistory = JSON.parse(
        localStorage.getItem("history") || "[]",
      );
      if (!previousHistory.find((x) => x.id === result.id)) {
        localStorage.setItem(
          "history",
          JSON.stringify([result, ...previousHistory]),
        );
      }
      console.log("Selected result:", result.Title, result.id);
      this.isLoading = true;
      this.error = null;
      this.bookFile = null;
      this.downloadProgress = 0;

      const filename = sanitize(
        `${result.Author} - ${result.Title}.${result.Extension}`,
      );

      this.directLink = appConfig.getDirectLink(result, filename);
      this.bookURL = appConfig.getBookURL(result, filename);

      try {
        const response = await fetch(this.bookURL);

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
          this.isLoading = false;
          receivedLength += value.length;

          this.downloadProgress = (receivedLength / contentLength) * 100;
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
        this.bookFile = new File([blob], filename, {
          type: response.headers.get("content-type"),
          lastModified: new Date().getTime(),
        });

        console.log("Download completed");
      } catch (error) {
        console.error("Download failed:", error);
        this.view = "error";
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
