<template>
  <li class="book">
    <div
      class="titles"
      :style="'background-image: url(' + book.image_url + ')'"
    >
      <h2 :title="book.title">
        <span>{{ book.title }}</span>
      </h2>
      <h3 v-if="book.author || book.year">
        <span
          >{{ book.author
          }}<template v-if="book.author && book.year">, </template
          >{{ book.year }}</span
        >
      </h3>
    </div>
    <footer
      :style="`background: linear-gradient(to right, #9f9 ${(book.fraction || 0) * 100}%, #ebebeb ${(book.fraction || 0) * 100}%);`"
    >
      <span class="ext"
        ><LucideFile :size="12" /> {{ book.ext?.toUpperCase() }}</span
      >
      <span class="ext"><LucideLanguages :size="12" />{{ book.lang }}</span>
      <span v-if="book.size" class="ext"
        ><LucideArrowBigDownDash :size="12" />
        {{ prettyBytes(book.size) }}</span
      >
    </footer>
  </li>
</template>

<style scoped>
footer {
  display: flex;
}

main.dark {
  .book {
    filter: invert(1);
  }
}

.book {
  width: 15rem;
  margin: 1rem;
  border: 1px solid lightgrey;
  box-shadow: 2px 2px 0.3rem #eee;
  margin-bottom: 1rem;
  list-style-type: none;

  .titles {
    height: 20rem;
    display: flex;
    transition: 0.1s all ease;
    background-size: cover;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 1rem;

    h2,
    h3 {
      margin: 0;
      font-size: 1rem;
      display: inline-block;
      span {
        background: rgba(255, 255, 255, 0.95);
        padding: 0 0.4rem;
        box-decoration-break: clone;
      }
    }

    h3 {
      font-size: 0.8rem;
    }
  }

  &:hover {
    cursor: pointer;

    .titles {
      h2,
      h3 {
        display: none;
      }
    }
  }
}

span.ext {
  font-size: 0.8rem;
  padding: 0 0.5rem;
  text-wrap: nowrap;
  flex-grow: 1;
  svg {
    margin-right: 0.3rem;
  }
}
</style>

<script setup>
import prettyBytes from "pretty-bytes";
defineProps({
  book: {
    type: Object,
    required: true,
  },
});
</script>
