<template>
  <Error v-if="error" :error="error" :attempted="lastResult" />
  <BookView
    :bookURL="bookURL"
    :downloadProgress="downloadProgress"
    :bookProgress="bookProgress"
    :bookFile="bookFile"
    v-if="bookFile"
  />
</template>

<script setup lang="ts">
const route = useRoute();
const bookFile = useState("bookFile", () => null);
const bookURL = useState("bookURL", () => "");
const downloadProgress = ref(100);
const bookProgress = ref(0);
const lastResult = useState("lastResult", () => null);
const isLoading = useState("isLoading", () => false);
const error = ref(null);

bookURL.value = "dropped";
</script>
