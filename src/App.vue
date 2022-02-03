<template>
  <div id="app">
    <!-- <div>
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div> -->
    <div class="container">
      <div class="row">
        <div class="col-12">
          <Header :assignmentNum="5" />
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
            labelX="People vaccinated per hundred"
            labelY="Total deaths per million"
          />
        </div>
      </div>
    </div>
    <div class="container container--custom">
      <div class="row">
        <div class="col-md-12">
          <!-- <YearSlider /> -->
          <TimeFilter header="Time filter (Full Vacination)" />
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row mb-5">
        <div class="col-md-6">
          <LineChart
            header="Full vaccination (2-doses) over time"
            labelX="Time"
            labelY="Vaccinated people per hundered"
          />
        </div>
        <div class="col-md-6">
          <BarChart header="Risk groups in population" labelY="Shares in %" />
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

.container.container--custom{
  max-width: 1300px;
}
</style>
