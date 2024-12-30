<template>
  <div id="content-books" @scroll="fetchMoreBooks">
    <BooksList
      :booksList="results"
      :isLoading="isLoading"
      v-if="route.name === 'index'"
    />
  </div>
</template>

<style scoped>
#content-books {
  overflow-y: scroll;
  height: 100%;
}
</style>

<script setup lang="ts">
definePageMeta({
  middleware: ["remotes"],
});
import { createDbWorker } from "sql.js-httpvfs";
import { useLocalStorage } from "@vueuse/core";
import { Liquid } from "liquidjs";
const liquid = new Liquid();

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url,
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

const defaultColumns = Object.fromEntries(
  ["title", "author", "ext", "lang"].map((x) => [x, x]),
);

const availableRemotes = useLocalStorage("availableRemotes", []);
const enabledRemotes = useLocalStorage("enabledRemotes", []);

const searchQuery = useState("searchQuery", () => "");
const lastQuery = useState("lastQuery", () => "");
const offset = useState("offset", () => 0);
const isLoading = useState("isLoading", () => false);
const moreResults = useState("moreResults", () => {});

const results = useState("results", () => []);
const route = useRoute();

watch(
  () => route.query.q,
  () => {
    fetchResults(true);
  },
);

onMounted(async () => {
  lastQuery.value = route.query.q || lastQuery.value || "";
  searchQuery.value = route.query.q || searchQuery.value || "";
  if (results.value.length) {
    fetchMoreBooks();
  } else {
    fetchResults(true);
  }
});

const setResults = (books, remote) => {
  const { images = "", columns = {} } = availableRemotes.value.find(
    (r) => r.full_name === remote,
  ).config;
  results.value = [
    ...results.value,
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

const fetchResults = async (reset = false) => {
  let query: any = lastQuery.value;
  try {
    query = JSON.parse(query) as {
      author: string;
      title: string;
      lang: string;
      ext: string;
    };
  } catch {
    // it's a simple query
  }
  console.log("Running query", query, reset, availableRemotes.value);
  if (reset) offset.value = 0;
  if (!enabledRemotes.value) {
    console.error("you have to choose at least one remote");
    navigateTo("/settings");
    return;
  }

  isLoading.value = true;
  if (!offset.value) results.value = [];
  let dbResult: any[] = [];

  let maxBytesToRead = 10 * 1024 * 1024;

  for (const remote of enabledRemotes.value) {
    const {
      dbConfig,
      tableName = "updated_data",
      columns = defaultColumns,
    } = JSON.parse(localStorage.getItem("availableRemotes") || "[]").find(
      (r) => r.full_name === remote,
    ).config;

    try {
      console.log(`Connecting to ${remote}...`, dbConfig);
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

      console.log(`Making the query to ${remote}, offset ${offset.value}...`);
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
      if (dbResult.length) {
        setResults(
          dbResult[0].values.map((line) =>
            Object.assign(
              {},
              ...dbResult[0].columns.map((n, index) => ({ [n]: line[index] })),
            ),
          ),
          remote,
        );
      }
    } catch (e) {
      console.error("Error while searching: ", e);
    }
    if (dbResult.length && dbResult[0].values.length) {
      moreResults.value = { ...moreResults.value, [remote]: true };
    } else {
      moreResults.value = { ...moreResults.value, [remote]: false };
    }
  }
  isLoading.value = false;
  fetchMoreBooks();
};

const fetchMoreBooks = () => {
  const obj = document.querySelector("#content-books") as HTMLDivElement;

  if (
    obj &&
    (obj.scrollTopMax === 0 || // There's no scroll
      obj.scrollTop + 1 >= obj.scrollHeight - obj.offsetHeight) && // We're at the bottom
    !isLoading.value &&
    route.name === "index" &&
    Object.values(moreResults.value).some((x) => x)
  ) {
    offset.value++;
    fetchResults();
  }
};
</script>
