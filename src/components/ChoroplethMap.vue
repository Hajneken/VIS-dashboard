<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <h2>
        Effect of vaccines on COVID-19 by
        {{ checked ? "country" : "state" }} in a map view
      </h2>
      <p v-bind:class="checked ? 'mb-5' : ''">
        Click on a {{ checked ? "country" : "state" }} below to highlight it on
        the scatterplot.<br />
      </p>
      <div v-if="loading">
        <b-spinner variant="primary" label="Spinning"></b-spinner>
      </div>
    </div>
    <svg
      id="Map"
      ref="choropleth"
      class="main-svg"
      :width="svgWidth"
      :height="svgHeight"
    >
      <g ref="choroplethContent"></g>
    </svg>

    <div class="d-flex justify-content-center enlarge">
      <span class="mr-2">Change map:</span>
      <span class="mr-2">USA</span>
      <b-form-checkbox v-model="checked" name="check-button" switch>
      </b-form-checkbox>
      <span>Europe</span>
    </div>
    <div>
      <b-button
        pill
        v-on:click.prevent="reset()"
        :disabled="selectedStates.length === 0"
        variant="outline-danger"
        ><b-icon icon="x-circle" class="mr-1" variant="danger"></b-icon>Cancel
        {{ checked ? "country" : "state" }} Selection</b-button
      >
    </div>
  </div>
</template>

<script>
import mapStatesUSA from "@/assets/us-states-geo.json";
import mapStatesEU from "@/assets/eu-map.json";

import * as d3 from "d3";

export default {
  name: "ChoroplethMap",
  props: {},
  data() {
    return {
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
      checked: true,
      loading: true,
    };
  },
  mounted() {
    this.drawMap();
  },
  methods: {
    drawMap() {
      const currentMap = this.checked ? mapStatesEU : mapStatesUSA;
      const svgMap = d3.select(this.$refs.choroplethContent);

      // 1. projection function converts takes a longitude and latitude => x, y coordinates
      // 2.  geographic path generator in: GeoJSON => SVG path
      const generatorUS = d3.geoPath().projection(
        d3
          .geoAlbersUsa()
          .scale([this.svgWidth / 2])
          .translate([this.svgWidth / 2, this.svgHeight / 2])
          .scale(1000)
      );
      const generatorEU = d3.geoPath().projection(
        d3
          .geoConicConformal()
          .rotate([-20.0, 0.0])
          .center([0.0, 52.0])
          .parallels([35.0, 65.0])
          .translate([this.svgWidth / 2, this.svgHeight / 2])
          .scale(this.svgWidth * 1.65)
          .precision(0.5)
      );

      // if map already drawn -> remove it and draw a new one
      if (this.$refs.choroplethContent.hasChildNodes()) {
        console.log("redrawing map ...");
        svgMap.html("");
      }

      if (this.checked) {
        svgMap
          .selectAll("path")
          .data(currentMap.features)
          .enter()
          .append("path")
          .attr("class", "map-state")
          .attr("id", (d) => `${d.properties.name.replaceAll(" ", "")}`)
          .attr("data-location", (d) => d.properties.name.replaceAll(" ", ""))
          .attr("d", (d) => generatorEU(d))
          .attr("fill", "#ffffff")
          .on("click", (e) => {
            this.handleStateClick(e);
          });
      } else {
        svgMap
          .selectAll("path")
          .data(currentMap.features)
          .enter()
          .append("path")
          .attr("class", "map-state")
          .attr("id", (d) => `State${d.properties.name.replaceAll(" ", "")}`)
          .attr("data-location", (d) => d.properties.name.replaceAll(" ", ""))
          .attr("d", (d) => generatorUS(d))
          .attr("fill", "#ffffff")
          .on("click", (e) => {
            this.handleStateClick(e);
          });
      }
      this.loading = false;
    },
    handleStateClick(event) {
      // highlight state
      // console.log('event :>> ', event.target.dataset.location);
      this.$store.commit("SET_SELECTED_STATES", [
        ...this.selectedStates,
        event.target.dataset.location,
      ]);
    },
    handleStateActive(data) {
      console.log("data :>> ", data);

      d3.select(this.$refs.choroplethContent)
        .selectAll("path")
        .attr("fill", "#ffffff");
      // I Just give a color here

      if (this.checked === false) {
        [...new Set(data)].forEach((el) => {
          d3.select(`#State${el.state.replaceAll(" ", "")}`).attr(
            "fill",
            el.color
          );
        });
      } else {
        [...new Set(data)].forEach((el) => {
          console.log("el eu :>> ", el);
          d3.select(`#${el.state.replaceAll(" ", "")}`).attr("fill", el.color);
        });
      }
    },
    reset() {
      d3.selectAll(`.selected`).classed("selected", false);
      this.$store.dispatch("reset");
    },
  },
  computed: {
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      },
    },
    personalIncome: {
      get() {
        return this.$store.getters.personalIncome;
      },
    },
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
    continent: {
      get() {
        return this.$store.getters.continent;
      },
    },
    data: {
      get() {
        return this.$store.getters.data;
      },
    },
    allStates: {
      get() {
        return this.$store.getters.allStates;
      },
    },
  },
  // Use this to watch for change in the data
  watch: {
    selectedStates: {
      handler() {
        console.log("this.allStates :>> ", this.allStates);
        this.handleStateActive(
          this.allStates.filter((el) => this.selectedStates.includes(el.state))
        );
      },
    },
    checked: {
      handler() {
        this.reset();
        const continentName = this.checked ? "EU" : "US";
        this.$store.dispatch("changeContinent", continentName);
        this.drawMap();
      },
    },
  },
};
</script>

<style>
#Map {
  filter: drop-shadow(2px 4px 6px #00000026);
}

.map-state {
  /* fill: #dee2e6; */
  stroke: #e8e8e8;
  /* fill: white; */
  stroke-width: 1;
  cursor: pointer;
  /* transition: 150ms all ease-in-out; */
}

.map-state:hover {
  /* fill: #b6b6b6; */
  filter: drop-shadow(5px 5px 5px #0000004d);
}

.map-state.active {
  fill: red;
}

.reset {
  fill: transparent;
}

.enlarge {
  margin: 1rem 0 1rem 0;
  transform: scale(2);
}
</style>
