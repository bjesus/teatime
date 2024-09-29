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

<script setup>
import { ref, onMounted } from "vue";

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

const getCSS = (style) => [
  `
    html, body {
      background: #fff;
      color: #000;
    }
  `,
];

const getRendition = async (rendition) => {
  const { book, renderer } = rendition;
  renderer.setStyles(getCSS());
  // console.log("but here it is", rendition.goToFraction);
  // const history = JSON.parse(localStorage.getItem("history"));
  // const { fraction } = history.find((b) => props.bookURL.includes(b.ipfs_cid));
  // console.log(rendition);
  // if (fraction) {
  //   console.log("trying to go to ", fraction);
  //   const what = rendition.goToFraction(fraction);
  //   console.log(what);
  //   console.log("done");
  // }
};

const onBookProgress = async (progress) => {
  console.log(progress);
  // if (progress.location.current === 0) {
  //   console.log("jumping!");
  //   console.log(view);
  //   await view.goToFraction(0.11215467001850396);
  //   console.log("or not");
  //   return;
  // }
  // console.log("not jumping");
  const history = JSON.parse(localStorage.getItem("history"));
  for (const i in history) {
    if (props.bookURL.includes(history[i].ipfs_cid)) {
      history[i].fraction = progress.fraction;
    }
  }
  localStorage.setItem("history", JSON.stringify(history));
};
</script>
