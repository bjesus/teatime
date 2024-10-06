<template>
  <div id="settings">
    <h2>Database</h2>
    <p :class="{ info: !remote }">
      Please choose a database for TeaTime to search in
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
            {{ item.updated_at.slice(0, 10) }}
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
    <h2>IPFS Gateway</h2>
    <p>Please choose a TeaTime compatible database to search in.</p>
    <table>
      <thead>
        <tr>
          <th class="center">Active</th>
          <th>Name</th>
          <th>Description</th>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(gateway, value) of appConfig.ipfsGateways"
          @click="setGateway(value)"
          :class="{ active: ipfsGateway === value }"
        >
          <td class="center">
            <input
              type="radio"
              name="ipfsGateway"
              :checked="ipfsGateway === value"
              @click="setGateway(value)"
            />
          </td>
          <td>{{ gateway.name }}</td>
          <td>{{ gateway.description }}</td>
          <td class="right">
            <a :href="gateway.info" target="_blank">
              <LucideExternalLink />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
#settings {
  max-width: 50rem;
  padding: 0 1rem;
  margin: auto;

  table {
    width: 100%;
    border: 0;

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
    color: darkred;
    background-color: rgba(255, 0, 0, 0.05);
    padding: 1rem;
    border: 1px solid red;
    border-radius: 1rem;

    &::before {
      content: "ℹ️ ";
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

const showAllRemotes = ref(false);
const remotes = ref([]);
const remote = useLocalStorage("remote");
const remoteConfig = useLocalStorage("remoteConfig");
const ipfsGateway = useLocalStorage("ipfsGateway");

const remotesList = computed(() => {
  return showAllRemotes.value ? remotes.value : remotes.value.slice(0, 5);
});

const updateRemotes = async () => {
  const response = await fetch(
    "https://api.github.com/search/repositories?q=topic:teatime-database&sort=stars&order=desc",
    // "/repos.json", // localdev
  );
  const { items } = await response.json();
  remotes.value = items;
};

onMounted(async () => {
  updateRemotes();
});

const setRemote = async (selection) => {
  const [owner, repo] = selection.full_name.split("/");
  const response = await fetch(
    `https://${owner}.github.io/${repo}/config.json`,
  );
  const config = await response.json();
  remoteConfig.value = JSON.stringify(config);
  remote.value = selection.full_name;
};

const setGateway = async (gateway) => {
  ipfsGateway.value = gateway;
};
</script>
