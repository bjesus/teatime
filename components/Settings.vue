<template>
  <div id="settings">
    <h2>Database</h2>
    <p class="info" v-if="!remote">
      Welcome! Before you can search, please choose which database you would
      like to query
    </p>
    <table>
      <thead>
        <tr>
          <th class="center">Active</th>
          <th class="center">⭐</th>
          <th>Name</th>
          <th>Description</th>
          <th>Updated</th>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in remotesList"
          :class="{ active: item.full_name === remote }"
          @click="setRemote(item)"
        >
          <td class="center">
            <input
              type="radio"
              name="remote"
              :checked="item.full_name === remote"
              @click="setRemote(item)"
            />
          </td>
          <td class="center">
            {{ item.stargazers_count }}
          </td>
          <td>
            {{ item.full_name }}
          </td>
          <td>
            {{ item.description }}
          </td>
          <td>
            {{ item.updated_at?.slice(0, 10) }}
          </td>
          <td class="right">
            <a :href="'https://github.com/' + item.full_name" target="_blank">
              <LucideExternalLink />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
    <button
      v-if="remotes.length > 5 && !showAllRemotes"
      @click="showAllRemotes = true"
    >
      Show all
    </button>
  </div>
</template>

<style scoped>
#settings {
  max-width: 50rem;
  padding: 0 1rem;
  margin: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    tr {
      cursor: pointer;
    }

    th {
      text-align: left;
      padding-bottom: 0.5rem;
    }

    th.center,
    td.center {
      text-align: center;
    }

    th.right,
    td.right {
      text-align: right;
    }

    td {
      margin: 0.5rem 0;
      padding: 0.5rem;
      vertical-align: top;
    }

    tr.active {
      box-shadow: 0px 0px 1px 1px rgba(0, 255, 0, 0.3);
      border-radius: 1rem;
      background-color: rgba(0, 255, 0, 0.05);
    }
  }

  table:has(tr:hover) tr:not(:hover) td {
    color: gray;
  }

  p.info {
    color: darkblue;
    background-color: rgba(0, 0, 255, 0.05);
    padding: 1rem;
    border: 1px solid blue;
    border-radius: 1rem;

    &::before {
      content: "👋 ";
    }
  }

  button {
    display: block;
    margin: 1rem auto 2rem;
  }
}
</style>

<script setup>
import { useLocalStorage } from "@vueuse/core";
const appConfig = useAppConfig();

const props = defineProps({
  onFetchResults: {
    type: Function,
    required: true,
  },
});

const showAllRemotes = ref(false);
const remotes = ref([]);
const remote = useLocalStorage("remote");
const remoteConfig = useLocalStorage("remoteConfig");

const remotesList = computed(() => {
  return showAllRemotes.value ? remotes.value : remotes.value.slice(0, 5);
});

const updateRemotes = async () => {
  const response = await fetch(
    "https://api.github.com/search/repositories?q=topic:teatime-database&sort=stars&order=desc",
    // "/repos.json", // localdev
  );
  let { items } = await response.json();
  // if (!items.length) {
  //   items = [
  //     {
  //       full_name: "yourmargin/libgen-db",
  //       description:
  //         "Library Genesis Non-Fiction, metadata snapshot from archive.org",
  //       stargazers_count: 10,
  //     },
  //     {
  //       full_name: "bjesus/teatime-datase",
  //       description: "Public domain library",
  //       stargazers_count: 5,
  //     },
  //     {
  //       full_name: "bjesus/teatime-json-datase",
  //       description: "An example database with The Communist Manifesto",
  //       stargazers_count: 1,
  //     },
  //   ];
  // }
  remotes.value = items;
};

onMounted(async () => {
  updateRemotes();
});

const setRemote = async (selection) => {
  props.onFetchResults("", true, selection.full_name);
};
</script>
