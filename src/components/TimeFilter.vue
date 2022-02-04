<template>
  <div class="mb-5" ref="lineChart">
    <h2 class="mb-4">{{ header }}</h2>
    <div>
      <b-spinner v-if="loading" variant="primary" label="Spinning"></b-spinner>
    </div>
    <p v-if="!loading">
      Adjust the time frame of the detailed view below by grabbing handle bars at the edges of greyed out
      area
    </p>
    <svg id="TimeFilter" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="lines-group" ref="linesGroup"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "TimeFilter",
  props: ["header"],
  data() {
    return {
      svgWidth: 1000,
      svgHeight: 200,
      svgPadding: {
        top: 40,
        right: 0,
        bottom: 0,
        left: 100,
      },
      loading: true,
      years: []
    };
  },
  mounted() {
    // console.log("Time filter mounted ...");
  },
  methods: {
    constructChart() {
      this.drawLines();
      this.drawXAxis();
      this.initBrush();
      this.loading = false;
    },
    initBrush() {
      let brush = d3.brushX().extent([
        [0, 0],
        [this.svgWidth, this.svgHeight],
      ]);

      brush.handleSize([10]);

      brush.on("end", (e) => {
        const normalizedTimeFrame = [
          this.xScale.invert(e.selection[0]),
          this.xScale.invert(e.selection[1]),
        ];
        // console.log("normalizedTimeFrame :>> ", normalizedTimeFrame);
        this.$store.commit("SET_TIME_FRAME", normalizedTimeFrame);
      });

      d3.select(this.$refs.linesGroup)
        .append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [0, this.svgWidth]);
    },
    drawLines() {
      d3.select(this.$refs.linesGroup)
        .selectAll(".line")
        .data(this.raw)
        .enter()
        .append("path")
        .attr("d", (d) => {
          const data = d.data.map((el) => [
            this.xScale(el.year),
            this.yScale(el.value),
          ]);
          return d3.line()(data);
        })
        .attr("class", "line")
        .attr("data-target", (d) => `TimeFilter${d.state.replaceAll(" ", "")}`)
        .attr("data-location", (d) => `${d.state.replaceAll(" ", "")}`);
    },
    handleStateActive(data) {
      if (data.length !== 0) {
        data.forEach((el) => {
          d3.select(`[data-target="TimeFilter${el.state}"]`).classed(
            "active",
            true
          );
          d3.select(`#TimeFilter${el.state}`).classed("active", true);
        });
      } else {
        d3.selectAll(".line.active").classed("active", false);
        d3.selectAll(".line__label.active").classed("active", false);
      }
    },
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr("transform", `translate( 0, ${this.svgHeight} )`)
        .call(d3.axisBottom(this.xScale));
    },
    drawYAxis() {
      d3.select(this.$refs.axisY).call(d3.axisLeft(this.yScale));
    },
  },
  computed: {
    continent: {
      get() {
        return this.$store.getters.continent;
      },
    },
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
    raw: {
      get() {
        return this.$store.getters.raw;
      },
    },
    allStates: {
      get() {
        return this.$store.getters.allStates;
      },
    },
    // should be years
    xScale() {
      if (this.continent === "US") {
        return d3
          .scaleLinear()
          .domain([d3.min(this.years), d3.max(this.years)])
          .range([0, this.svgWidth]);
      }
      return d3
        .scaleTime()
        .domain([d3.min(this.years), d3.max(this.years)])
        .range([0, this.svgWidth]);
    },
    yScale() {
      return d3
        .scaleLinear()
        .domain([0, this.computeMax * 1.1])
        .range([this.svgHeight, 0]);
    },
    computeMax() {
      // take raw data, convert object to arrays,
      // take the second (data) instance and retrieve value from nested object
      return d3.max(
        this.raw.map((el) => Object.values(el)[1].map((el) => el.value)).flat()
      );
    },
  },
  watch: {
    raw: {
      handler() {
        this.loading = true;
        this.years = this.raw[1].data.map((el) => el.year);
        d3.select(this.$refs.linesGroup).html("");
        this.constructChart();
      },
    },
    selectedStates: {
      handler() {
        this.handleStateActive(
          this.allStates.filter((el) => this.selectedStates.includes(el.state))
        );
      },
    },
  },
};
</script>

<style scoped>
svg {
  overflow: visible;
  border-radius: 10px;
}
#TimeFilter {
  box-shadow: 5px 6px 8px 1px #0000001f;
}
</style>

<style>
.line {
  stroke: #969595;
  fill: none;
  stroke-width: 1.7px;
  cursor: pointer;
}

.line.hovered {
  stroke-width: 3px;
}

.hovered {
  display: block;
  stroke: var(--orange);
}

.line.active {
  stroke: var(--primary);
  stroke-width: 3px;
}

.line__label {
  font-size: 15px;
  display: none;
}

.line__label.hovered {
  display: block;
}

.line__label.active {
  display: block;
  fill: var(--primary);
  /* font-weight: bold; */
}

.line.hovered.active {
  stroke: var(--orange);
}

#TimeFilter .handle {
  fill: #ffffffd9;
  stroke: black;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.253));
  rx: 4;
  ry: 6;
}
</style>

