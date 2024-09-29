<template>
  <h1>remote</h1>
  <table>
    <thead>
      <tr>
        <th>⭐</th>
        <th>name</th>
        <th>description</th>
        <td></td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in remotes">
        <td>
          {{ item.stargazers_count }}
        </td>
        <td>
          {{ item.full_name }}
        </td>
        <td>
          {{ item.description }}
        </td>
        <td><input type="radio" name="remote" @click="setRemote(item)" /></td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped></style>

<script setup>
import { useLocalStorage } from "@vueuse/core";

const remotes = ref([]);
const remote = useLocalStorage("remote");
const remoteConfig = useLocalStorage("remoteConfig");

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
</script>
