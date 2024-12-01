<template>
  <header class="loading">
    <h1 @click="view = 'results'">{{ icon }} {{ title }}</h1>
    <div id="options">
      <p>
        <a @click="view = 'settings'" title="Settings">
          <LucideSettings />
        </a>
        <a
          v-if="view === 'book' && !isLoading"
          @click="onDownloadBook"
          title="Download book"
        >
          <LucideDownload />
        </a>
        <a v-if="view === 'book'" @click="setFullScreen" title="Go full screen">
          <LucideExpand />
        </a>
        <a @click="view = 'history'" title="History">
          <LucideHistory />
        </a>
        <a
          title="Back to book"
          v-if="view !== 'book' && bookURL"
          @click="view = 'book'"
        >
          <LucideBookOpen />
        </a>
        <a @click="view = 'search'" title="Advanced Search">
          <LucideSearch
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
        @keyup.enter="search"
        placeholder="What would you like to read today?"
        autofocus
        :class="{ loading: isLoading }"
      />
    </div>
  </header>
</template>

<style>
header {
  padding: 8px;
  grid-area: 1 / 1 / 2 / 2;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: 1fr auto;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  grid-template-areas:
    "logo options"
    "search search";

  @media (min-width: 600px) {
    grid-template-columns: 1fr 45rem 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "logo search options";
  }

  #options {
    grid-area: options;
    margin: 0;
    text-align: right;
    padding: 0 0.5rem 0 0;

    svg {
      margin-left: 1rem;
      cursor: pointer;
      width: 1rem;
      height: 1rem;
      @media (min-width: 600px) {
        width: auto;
        height: auto;
      }
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
      &.loading {
        background: repeating-linear-gradient(
          45deg,
          #ddf5ff 100px,
          #b0bbff 200px
        );
        background-size: calc(20px / sin(45deg)) 100%;
        animation: move-stripes 10s linear infinite;
      }
    }
  }
}
@keyframes move-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 0; /* Adjust as needed for the speed */
  }
}
</style>
<script setup>
const props = defineProps({
  onFetchResults: {
    type: Function,
    required: true,
  },
  onDownloadBook: {
    type: Function,
    required: true,
  },
});

const searchQuery = ref("");
const darkMode = useState("darkMode");
const view = useState("view");
const isLoading = useState("isLoading");
const icon = useState("icon");
const title = useState("title");
const bookURL = useState("bookURL");

const search = (event) => {
  props.onFetchResults(searchQuery.value, true);
};

const setFullScreen = () => {
  const content = document.getElementById("content");
  content.requestFullscreen();
};
</script>
