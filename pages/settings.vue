<template>
  <div id="settings">
    <h2>Database</h2>
    <p class="info" v-if="!enabledRemotes.length">
      You have to choose at least one database before you can search.
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
        <tr v-for="item in availableRemotes" @click="toggleRemote(item)">
          <td class="center">
            <input
              type="checkbox"
              name="remote"
              :checked="enabledRemotes.includes(item.full_name)"
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
      v-if="availableRemotes.length > 5 && !showAllRemotes"
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
definePageMeta({
  middleware: ["remotes"],
});

import { useLocalStorage } from "@vueuse/core";

const showAllRemotes = ref(false);
const availableRemotes = useLocalStorage("availableRemotes", []);
const enabledRemotes = useLocalStorage("enabledRemotes", []);

const toggleRemote = (remote) => {
  if (enabledRemotes.value.includes(remote.full_name)) {
    enabledRemotes.value = enabledRemotes.value.filter(
      (x) => x !== remote.full_name,
    );
  } else {
    enabledRemotes.value.push(remote.full_name);
  }
};
</script>
