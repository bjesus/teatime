<template>
  <div v-if="bookURL && !bookFile" id="downloadStatus">
    <p>
      <span v-if="downloadProgress > 0">Downloading</span
      ><span v-else>Connecting to</span> {{ bookURL }}
    </p>
    <progress v-if="downloadProgress" max="100" :value="downloadProgress">
      {{ downloadProgress }}%
    </progress>
  </div>
  <article v-if="bookFile">
    <component
      :is="VueReader"
      v-if="VueReader"
      :url="bookFile"
      style="height: 100%"
      :getRendition="getRendition"
    />
  </article>
</template>

<style>
#downloadStatus {
  p {
    margin: 0 1rem;
    color: gray;
    font-size: 0.7rem;
  }
  progress {
    border-radius: 0;
    width: 100%;
  }
}

article {
  height: 100%;
}

button.arrow {
  color: black;
}

.tocButtonBar {
  background: black;
}
</style>

<script setup>
import { ref, onMounted } from "vue";

const VueReader = ref(null);

const props = defineProps({
  bookURL: {
    type: String,
    required: true,
  },
  downloadProgress: {
    type: Number,
    required: false,
  },
  bookFile: {
    type: File,
    required: true,
  },
});

onMounted(async () => {
  const module = await import("vue-book-reader");
  VueReader.value = module.VueReader;
});

const getCSS = (style) => [
  `
    html, body {
      background: #fff;
      color: #000;
    }
  `,
];

const getRendition = (rendition) => {
  const { book, renderer } = rendition;
  renderer.setStyles(getCSS());
};
</script>
