<template>
  <div v-if="bookURL && !bookFile" id="downloadStatus">
    <p>
      <span v-if="downloadProgress > 0"
        >Downloading {{ bookURL }} from IPFS...</span
      ><span v-else>Trying to find {{ bookURL }} on IPFS...</span>
    </p>
    <progress v-if="downloadProgress" max="100" :value="downloadProgress">
      {{ downloadProgress }}%
    </progress>
  </div>
  <article v-if="bookFile">
    <component
      :is="VueReader"
      v-if="VueReader"
      @update:location="onBookProgress"
      :url="bookFile"
      style="height: 100%"
      :location="bookProgress"
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

<script setup lang="ts">
import { onMounted } from "vue";

const VueReader = shallowRef(null);

const props = defineProps({
  bookURL: {
    type: String,
    required: true,
  },
  downloadProgress: {
    type: Number,
    required: false,
  },
  bookProgress: {
    type: Number,
    required: false,
  },
  bookFile: {
    type: File,
    required: false,
  },
});

onMounted(async () => {
  const module = await import("vue-book-reader");
  VueReader.value = module.VueReader;
});

const getCSS = () => [
  `
    html, body {
      background: #fff;
      color: #000;
    }
  `,
];

const getRendition = async (rendition) => {
  const { renderer } = rendition;
  renderer.setStyles?.(getCSS());
  const history = JSON.parse(localStorage.getItem("history"));
  const { fraction } = history.find((b) => props.bookURL.includes(b.ipfs_cid));
  if (fraction) {
    await rendition.goToFraction(fraction);
    rendition.prev(); // for some reason we're always jumping one page too far
  }
};

const onBookProgress = async (progress) => {
  const history = JSON.parse(localStorage.getItem("history"));
  for (const i in history) {
    if (props.bookURL.includes(history[i].ipfs_cid)) {
      history[i].fraction = progress.fraction;
    }
  }
  if (history) localStorage.setItem("history", JSON.stringify(history));
};
</script>
