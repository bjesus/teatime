<template>
  <div id="results">
    <ul v-if="booksList.length">
      <BookCard
        v-for="(result, index) in booksList"
        :key="index"
        :book="result"
        @click="onBookClick(result)"
      />
    </ul>
    <p v-if="isLoading">Searching {{ remote }}...</p>
    <p v-if="!isLoading && !booksList.length">No results</p>
  </div>
</template>

<style scoped>
ul {
  margin: auto;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
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
  onFetchMoreBooks: {
    type: Function,
    required: true,
  },
});

const remote = useLocalStorage("remote", null);
</script>
