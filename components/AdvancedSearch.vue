<template>
  <div id="complex-search">
    <div>
      <label
        >Book title
        <input v-model.trim="csTitle" />
      </label>
    </div>
    <div>
      <label
        >Author
        <input v-model.trim="csAuthor" />
      </label>
    </div>
    <div class="selectors">
      <label
        >Format
        <select v-model="csExt">
          <option value="">Any format</option>
          <option value="epub">ePub</option>
          <option value="pdf">PDF</option>
          <option value="mobi">MOBI</option>
        </select>
      </label>
      <label
        >Language
        <select v-model="csLang">
          <option value="">Language</option>
          <option value="Arabic">Arabic</option>
          <option value="Belarusian">Belarusian</option>
          <option value="Bengali">Bengali</option>
          <option value="Bulgarian">Bulgarian</option>
          <option value="Castilian">Castilian</option>
          <option value="Catalan">Catalan</option>
          <option value="Chinese">Chinese</option>
          <option value="Croatian">Croatian</option>
          <option value="Czech">Czech</option>
          <option value="Danish">Danish</option>
          <option value="Dutch">Dutch</option>
          <option value="English">English</option>
          <option value="Flemish">Flemish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Greek">Greek</option>
          <option value="Hebrew">Hebrew</option>
          <option value="Hindi">Hindi</option>
          <option value="Hungarian">Hungarian</option>
          <option value="Indonesian">Indonesian</option>
          <option value="Italian">Italian</option>
          <option value="Japanese">Japanese</option>
          <option value="Kazakh">Kazakh</option>
          <option value="Korean">Korean</option>
          <option value="Latin">Latin</option>
          <option value="Lithuanian">Lithuanian</option>
          <option value="Norwegian">Norwegian</option>
          <option value="Persian">Persian</option>
          <option value="Polish">Polish</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Romanian">Romanian</option>
          <option value="Russian">Russian</option>
          <option value="Serbian">Serbian</option>
          <option value="Spanish">Spanish</option>
          <option value="Swedish">Swedish</option>
          <option value="Tamil">Tamil</option>
          <option value="Thai">Thai</option>
          <option value="Turkish">Turkish</option>
          <option value="Ukrainian">Ukrainian</option>
          <option value="Urdu">Urdu</option>
          <option value="Vietnamese">Vietnamese</option>
        </select>
      </label>
    </div>
    <button @click="makeAdvancedSearch">Advanced Search</button>
  </div>
</template>

<style scoped>
#complex-search {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  & > div {
    margin-bottom: 1rem;
  }
  label {
    display: block;
  }

  input {
    width: 100%;
    @media (min-width: 600px) {
      width: 40rem;
    }
  }
  .selectors {
    display: flex;
    width: 100%;
    @media (min-width: 600px) {
      width: 40rem;
    }
    justify-content: space-evenly;
  }

  input,
  select,
  button {
    border-radius: 1rem;
    display: block;
    padding: 0.5rem;
    border: 1px solid lightgray;
  }
}
</style>

<script setup>
const props = defineProps({
  onFetchResults: {
    type: Function,
    required: true,
  },
});

const csTitle = ref("");
const csAuthor = ref("");
const csExt = ref("");
const csLang = ref("");

const makeAdvancedSearch = () => {
  props.onFetchResults(
    {
      title: csTitle.value,
      author: csAuthor.value,
      ext: csExt.value,
      lang: csLang.value,
    },
    true,
  );
};
</script>
