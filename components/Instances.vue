<template>
  <div id="instances">
    <h2>Instances</h2>
    <p class="info">TeaTime is open-source, and everyone can start an instance of it in just a few minutes.</p>
    <p>Hosting an instance? <a target="_blank" href="https://github.com/bjesus/teatime/wiki/Creating-a-TeaTime-instance">Let the world know about it.</a></p>
    <div v-for="item in instancesList" class="instance">
      <a :href="'https://github.com/' + item.full_name" target="_blank">
        {{ item.stargazers_count }} Stars
      </a>
      <a :href="'https://github.com/' + item.owner.login" target="_blank">
      <img :src="item.owner.avatar_url"></img>
        {{ item.owner.login }}</a>
      <h3>🔗 <a target="_blank" :href="item.homepage">{{ formatHomage(item.homepage) }}</a></h3>
      <p>{{ item.description }}</p>
          </div>
    <button
      v-if="instances.length > 5 && !showAllInstances"
      @click="showAllInstances = true"
    >
      Show all
    </button>
  </div>
</template>

<style scoped>
#instances {
  max-width: 50rem;
  padding: 0 1rem;
  margin: auto;

  button {
    display: block;
    margin: 1rem auto 2rem;
  }

  .instance {
    border: 1px solid #eee;
    margin-bottom: 1rem;
      border-radius: 1rem;
    padding: 1rem;
    h3 {
      font-size: 1.2rem;
      margin: 0;

      a {
        text-decoration: none;
        color: navy;

      }
    }

    > a {
      float: right;
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      background: Azure;
      color: navy;
      font-weight: bold;
      font-size: 0.75rem;
      border-radius: 5px;
      border: 1px solid LightSteelBlue;
      margin-left: 0.5rem;

    img {
        max-width: 1rem;
        vertical-align: middle;
      }
 
      &:hover {
        background: HoneyDew;
      }
    }

    p {
      margin-bottom: 0;
    }
  }
}
</style>

<script setup>
const appConfig = useAppConfig();

const showAllInstances = ref(false);
const instances = ref([]);

const instancesList = computed(() => {
  return showAllInstances.value ? instances.value : instances.value.slice(0, 5);
});

const updateInstances = async () => {
  const response = await fetch(
    "https://api.github.com/search/repositories?q=topic:teatime-instance&sort=stars&order=desc",
    // "/repos.json", // localdev
  );
  const { items } = await response.json();
  instances.value = items;
};

onMounted(async () => {
  updateInstances();
});

const formatHomage = (url) => {
  return url.split("://")[1].replace(/\/$/, "");
}
</script>
