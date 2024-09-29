<template>
  <div id="settings">
    <h2>Database</h2>
    <p>Please choose a TeaTime compatible database to search in.</p>
    <table>
      <thead>
        <tr>
          <th class="center">Active</th>
          <th class="center">⭐</th>
          <th>Name</th>
          <th>Description</th>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in remotes"
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
          <td class="right">
            <a :href="'https://github.com/' + item.full_name" target="_blank">
              <LucideExternalLink />
            </a>
          </td>
        </tr>
      </tbody>
    </table>
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
          :class="{ active: ipfsGateway === gateway.value }"
          @click="setGateway(gateway.value)"
          v-for="gateway in appConfig.ipfsGateways"
        >
          <td class="center">
            <input
              type="radio"
              name="ipfsGateway"
              :checked="ipfsGateway === gateway.value"
              @click="setGateway(item)"
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
    }

    tr.active {
      box-shadow: 0px 0px 2px 2px #ccc;
      border-radius: 1rem;
    }
  }
}
</style>

<script setup>
import { useLocalStorage } from "@vueuse/core";
const appConfig = useAppConfig();

const remotes = ref([]);
const remote = useLocalStorage("remote");
const remoteConfig = useLocalStorage("remoteConfig");
const ipfsGateway = useLocalStorage("ipfsGateway");

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
  console.log(selection.full_name);
  const [owner, repo] = selection.full_name.split("/");
  const response = await fetch(
    `https://${owner}.github.io/${repo}/config.json`,
  );
  const config = await response.json();
  remoteConfig.value = JSON.stringify(config);
  remote.value = selection.full_name;
  console.log(config);
};

const setGateway = async (gateway) => {
  ipfsGateway.value = gateway;
};
</script>
