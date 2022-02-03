<template>
  <div id="GraphContainer" ref="lineChart">
    <h2 class="mb-4">{{ header }}</h2>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <clipPath id="getRekt"><rect height="480" width="800"></rect></clipPath>
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
  name: "LineChart",
  props: ["header", "labelX", "labelY"],
  data() {
    return {
      svgWidth: 800,
      svgHeight: 480,
      svgPadding: {
        top: 40,
        right: 0,
        bottom: 0,
        left: 100,
      },
      loading: true,
      dates: [],
    };
  },
  mounted() {
    // console.log("Line Chart mounted ...");
  },
  methods: {
    constructChart() {
      this.drawLines();
      this.drawXAxis();
      this.drawYAxis();
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
        .attr("clip-path", "url(#getRekt)")
        .attr("class", "line")
        .attr("data-target", (d) => `LineChart${d.state.replaceAll(" ", "")}`)
        .attr("data-location", (d) => `${d.state.replaceAll(" ", "")}`)
        .on("click", (e) => this.handleLineClick(e))
        .on("mouseover", function () {
          if (d3.select(this).classed("hovered")) {
            d3.select(this).classed("hovered", false);
          } else {
            d3.select(this).classed("hovered", true);
          }
          if (d3.select(`#${this.dataset.target}`).classed("hovered")) {
            d3.select(`#${this.dataset.target}`).classed("hovered", false);
          } else {
            d3.select(`#${this.dataset.target}`).classed("hovered", true);
          }
        })
        .on("mouseout", function () {
          // console.log("hovered END :>> ", this);
          if (d3.select(this).classed("hovered")) {
            d3.select(this).classed("hovered", false);
          } else {
            d3.select(this).classed("hovered", true);
          }
          if (d3.select(`#${this.dataset.target}`).classed("hovered")) {
            d3.select(`#${this.dataset.target}`).classed("hovered", false);
          } else {
            d3.select(`#${this.dataset.target}`).classed("hovered", true);
          }
        });

      d3.select(this.$refs.linesGroup)
        .selectAll(".line__label")
        .data(this.raw)
        .enter()
        .append("text")
        .attr("id", (d) => `LineChart${d.state.replaceAll(" ", "")}`)
        .attr("x", this.svgWidth)
        .attr("y", (d) => this.yScale(d.data[d.data.length - 1].value))
        .attr("class", "line__label")
        .append("tspan")
        .text((d) => d.state);
    },
    handleLineClick(e) {
      if (d3.select(e.target).classed("active")) {
        d3.select(e.target).classed("active", false);
      } else {
        d3.select(e.target).classed("active", true).raise();
      }
      if (d3.select(`#${e.target.dataset.target}`).classed("active")) {
        d3.select(`#${e.target.dataset.target}`).classed("active", false);
      } else {
        d3.select(`#${e.target.dataset.target}`).classed("active", true);
      }
      this.$store.commit("CHANGE_SELECTED_STATE", e.target.dataset.location);
    },
    handleStateActive(data) {
      if (data.length !== 0) {
        data.forEach((el) => {
          d3.select(`[data-target="LineChart${el.state}"]`).classed(
            "active",
            true
          );
          d3.select(`#LineChart${el.state}`).classed("active", true);
        });
      } else {
        d3.selectAll(".line.active").classed("active", false);
        d3.selectAll(".line__label.active").classed("active", false);
      }
    },
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr("transform", `translate( 0, ${this.svgHeight} )`)
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -7)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");

      d3.select(this.$refs.axisX)
        .append("text")
        .attr("y", -10)
        .attr("x", this.svgWidth)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text(`${this.$props.labelX}`);
    },
    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale).tickSize(-this.svgWidth))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text(`${this.$props.labelY}`);
    },
    handleTimeChange(timeInterval) {
      this.xScale.domain([timeInterval[0], timeInterval[1]]);

      let updateLine = d3
        .line()
        .x((d) => this.xScale(d.year))
        .y((d) => this.yScale(d.value));

      d3.select(this.$refs.linesGroup)
        .selectAll(".line")
        .transition()
        .duration(800)
        .attr("d", (d) => updateLine(d.data));

      //update X axis
      // console.log('d3.select(this.$refs.) :>> ', d3.select(this.$refs.axisX));
      d3.select(this.$refs.axisX)
        .transition()
        .duration(800)
        .call(d3.axisBottom(this.xScale))
        .selectAll(".tick text")
        .attr("y", 0)
        .attr("x", -7)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");
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
    timeFrame: {
      get() {
        return this.$store.getters.timeFrame;
      },
    },
    // should be dates
    xScale() {
      if (this.continent === "US") {
        return d3
          .scaleLinear()
          .domain([d3.min(this.years), d3.max(this.years)])
          .range([0, this.svgWidth]);
      }
      return d3.scaleTime().domain(this.dates).range([0, this.svgWidth]);
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
      const max = d3.max(
        this.raw.map((el) => Object.values(el)[1].map((el) => el.value)).flat()
      );
      return max;
    },
    data: {
      get() {
        return this.$store.getters.data;
      },
    },
  },
  watch: {
    // continent: {
    //   handler() {
    //     // console.log('this.continent :>> ', this.continent);
    //     this.constructChart();
    //   },
    // },
    raw: {
      handler() {
        this.loading = false;
        this.dates = this.raw[1].data.map((el) => el.year);
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
    timeFrame: {
      handler() {
        this.handleTimeChange(this.timeFrame);
      },
    },
  },
};
</script>

<style scoped>
svg {
  overflow: visible;
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

.tick line {
  stroke-dasharray: 5, 3;
  color: #007aff40;
}
</style>
