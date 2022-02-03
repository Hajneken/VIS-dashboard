<template>
  <div class="prettify mt-3 mb-3">
    <h2>Select Timeframe</h2>
    <p>Try moving the slider around to change the year!</p>
    <b-form-input
      id="range-year"
      v-model="selectedYear"
      type="range"
      min="2006"
      max="2019"
    ></b-form-input>
    <div class="mt-2">
      Year: <strong>{{ selectedYear }}</strong>
    </div>
  </div>
</template>

<script>
export default {
  name: "YearSlider",
  props: {},
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  computed: {
    selectedYear: {
      get() {
        return this.$store.getters.selectedYear;
      },
      set(val) {
        this.$store.dispatch("reset");
        this.$store.commit("CHANGE_SELECTED_YEAR", val);
      },
    },
  },
  watch: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.prettify {
  padding: 20px 50px;
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 15%);
}
</style>
