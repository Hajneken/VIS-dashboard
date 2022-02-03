<template>
  <div id="app">
    <!-- <div>
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div> -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <Header :assignmentNum="5" />
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6">
          <ChoroplethMap />
        </div>
        <div class="col-md-6">
          <Scatterplot
            header="Cummulative share of vaccinated and infected per million"
            labelX="Total Cases Per Million"
            labelY="Hospitalized patients per million"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <!-- TODO Transform to TimeFrame with handles -->
          <!-- <YearSlider /> -->
          <TimeFilter header="Time Adjuster" />
        </div>
      </div>
      <div class="row mb-5">
        <div class="col-md-6">
          <LineChart
            header="Fully vaccinated people over time"
            labelX="Time"
            labelY="Number of people"
          />
        </div>
        <div class="col-md-6">
          <BarChart labelY="Cumulative number of people" />
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
    // YearSlider,
    BarChart,
    LineChart,
    TimeFilter,
  },
  mounted() {
    this.$store.dispatch("loadData");
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

.slider--center {
  margin: auto 0;
}
</style>
