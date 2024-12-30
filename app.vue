<template>
  <NuxtPwaManifest />
  <main :class="{ dark: darkMode }">
    <Header />
    <div
      id="content"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'drag-over': isDragging }"
    >
      <NuxtPage />
    </div>
    <footer>
      {{ title }} is an instance of
      <a href="https://github.com/teatime-library/teatime" target="_blank"
        >TeaTime</a
      >, a distributed, static, cookie-less system for reading books over IPFS.
      See <NuxtLink to="/settings">Settings</NuxtLink> or
      <NuxtLink to="/instances">other instances</NuxtLink>.
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
const appConfig = useAppConfig();

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

const darkMode = useState("darkMode", () => false);
const title = useState("title", () => appConfig.title);
const icon = useState("icon", () => appConfig.icon); // initialized here and used on other pages

const bookFile = useState("bookFile", () => null as null | File);
const isDragging = ref(false);

onMounted(async () => {});

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files?.length) {
    bookFile.value = files[0];
    isDragging.value = false;

    navigateTo("/open/dropped");
  }
};
</script>
