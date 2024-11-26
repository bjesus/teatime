<template>
  <div id="results">
    <ul v-if="booksList.length">
      <li
        v-for="(result, index) in booksList"
        :key="index"
        @click="onBookClick(result)"
      >
        <img
          v-if="result.image_url"
          :src="result.image_url"
          referrerpolicy="no-referrer"
        />
        <div>
          <h2 :title="result.title">{{ result.title }}</h2>
          <h3>{{ result.author }}, {{ result.year }}</h3>
          <span class="ext"><LucideFile :size="12" /> {{ result.ext }}</span>
          <span class="ext"
            ><LucideLanguages :size="12" />{{ result.lang }}</span
          >
          <span v-if="result.size" class="ext"
            ><LucideArrowBigDownDash :size="12" />
            {{ prettyBytes(result.size) }}</span
          >
          <meter min="0" max="1" :value="result.fraction" />
        </div>
      </li>
    </ul>
    <p v-else-if="isLoading">Searching {{ remote }}...</p>
    <p v-else>No results</p>
    <button
      v-if="booksList.length && paginate"
      @click="
        () => onFetchResults(JSON.parse(lastQuery), offset + 1) && offset++
      "
    >
      More
    </button>
  </div>
</template>

<style scoped>
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
    meter {
      width: 100%;
    }
  }
}

button {
  margin: auto;
  display: flex;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
}

p {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-weight: bold;
  color: lightgray;
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
</style>

<script setup>
import prettyBytes from "pretty-bytes";
import { useLocalStorage } from "@vueuse/core";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  booksList: {
    type: Array,
    required: true,
  },
  onBookClick: {
    type: Function,
    required: true,
  },
  paginate: {
    type: Boolean,
    required: false,
  },
  onFetchResults: {
    type: Function,
    required: false,
  },
});

const remote = useLocalStorage("remote", null);
const lastQuery = useLocalStorage("lastQuery", null);
const offset = useState("offset", () => 0);

onMounted(async () => {
  offset.value = 0;
});
</script>
