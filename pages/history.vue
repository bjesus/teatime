<template>
  <div id="content-books">
    <BooksList :booksList="booksList" :isLoading="false" />
  </div>
</template>

<style>
#content-books {
  overflow-y: scroll;
  height: 100%;
}
</style>

<style scoped></style>

<script setup lang="ts">
const booksList = JSON.parse(localStorage.getItem("history") || "[]");
</script>
