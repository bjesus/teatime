<template>
  <div class="error">
    <h3>houston we have a problem 😵</h3>
    <code>
      {{ error }}
    </code>
    <br />
    <p v-if="directLink">
      You can try
      <a target="_blank" :href="directLink">downloading the file directly</a>
      and then drag-n-drop it here
    </p>
    <br />
    <button @click="onRetry(attempted)">Try again</button>
    <button @click="navigateTo('')">Back to results</button>
  </div>
</template>

<style>
.error {
  text-align: center;
  code {
    font-family: monospace;
    background: black;
    color: green;
    padding: 1rem;
    margin: 1rem;
  }
  p {
    margin-top: 2rem;
  }
  button {
    margin-top: 4rem;
    border-radius: 1rem;
    border: 1px solid gray;
    padding: 0.5rem 1rem;
    margin-right: 1rem;
    height: 100%;
  }
}
</style>

<script setup>
defineProps({
  error: {
    type: String,
    required: true,
  },
  attempted: {
    type: Object,
    required: true,
  },
});
</script>
