<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <Header :assignmentNum="5" />
          <b-alert v-model="map" show variant="danger">
            <h3>Preview</h3>
            <strong
              >Since the dataset does not contain per US state information
              (countries only), unrelated data are used for a demo</strong
            ></b-alert
          >
        </div>
      </div>
    </div>
    <div class="container container--custom mb-4">
      <div class="row">
        <div class="col-md-6">
          <ChoroplethMap />
        </div>
        <div class="col-md-6">
          <Scatterplot
            header="Effect of vaccines on COVID-19 deaths"
            labelX="People vaccinated per hundred people"
            labelY="New Deaths over 7 days per million people"
          />
        </div>
      </div>
    </div>
    <div class="container container--custom">
      <div class="row">
        <div class="col-md-12">
          <TimeFilter header="Full Vacination: Time filter" />
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row mb-5">
        <div class="col-md-6">
          <LineChart
            header="Full vaccination in countries (2 doses) over time: detailed view"
            labelX="Time"
            labelY="Vaccinated people per hundered"
          />
        </div>
        <div class="col-md-6">
          <BarChart header="Risk groups in populations" labelY="in %" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Scatterplot from "./components/Scatterplot.vue";
import ChoroplethMap from "./components/ChoroplethMap.vue";
// import YearSlider from "./components/YearSlider.vue";
import BarChart from "./components/BarChart.vue";
import LineChart from "./components/LineChart.vue";
import TimeFilter from "./components/TimeFilter.vue";

export default {
  name: "App",
  components: {
    Header,
    Scatterplot,
    ChoroplethMap,
    BarChart,
    LineChart,
    TimeFilter,
  },
  data() {
    return {
      map: false,
    };
  },
  mounted() {
    this.$store.dispatch("loadData");
  },
  computed: {
    continent: {
      get() {
        return this.$store.getters.continent;
      },
    },
  },
  watch: {
    continent: {
      handler() {
        if (this.continent === "US") {
          this.map = true;
        } else {
          this.map = false;
        }
      },
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,500;0,700;1,500&family=Cormorant:ital,wght@0,500;0,700;1,500&family=Roboto+Slab:wght@400;500;700&display=swap");
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  font-family: "Roboto Slab", serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.container.container--custom {
  max-width: 1300px;
}
</style>
