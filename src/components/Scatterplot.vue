<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <h2>{{ header }}</h2>
      <p v-if="!loading">
        <strong>Hold Click &amp; Drag</strong> (<abbr
          title="Fancy name for drawing a rectangular area with a mouse."
          >brush</abbr
        >) over the points or <strong>click</strong> them to color states in the
        map.
      </p>
      <p v-if="!loading">
        <span v-if="this.continent !== 'US'">showing date:</span>
        <abbr
          title="Date purposefully chosen to caputure statistics released on the same day by as many countries as possible"
          ><strong v-if="this.continent !== 'US'">{{
            ` ${this.processedData[0].date}`
          }}</strong>
        </abbr>
      </p>
      <b-spinner v-if="loading" variant="primary" label="Spinning"></b-spinner>
    </div>
    <svg
      ref="chart"
      class="main-svg mb-4"
      :width="svgWidth"
      :height="svgHeight"
    >
      <g ref="chartContent">
        <g class="axis axis-x" ref="x"></g>
        <g class="axis axis-y" ref="y"></g>
        <g class="brush" ref="brush"></g>
        <g ref="points"></g>
      </g>
    </svg>
    <div>
      <b-button
        pill
        v-on:click="hardReset()"
        :disabled="selectedLocations.length === 0"
        variant="outline-danger"
        ><b-icon icon="x-circle" class="mr-1" variant="danger"></b-icon>Cancel
        Selection</b-button
      >
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Scatterplot",
  props: ["header", "labelX", "labelY"],
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
      colors: [
        "#be64ac",
        "#8c62aa",
        "#3b4994",
        "#dfb0d6",
        "#a5add3",
        "#5698b9",
        "#d0d0d0",
        "#ace4e4",
        "#5ac8c8",
      ],
      loading: true,
      rectangles: [],
      brush: [],
    };
  },
  mounted() {
    // this.constructChart();
  },
  methods: {
    constructChart() {
      d3.select(this.$refs.chartContent).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawBackground();
      this.xAxis();
      this.yAxis();
      this.plotData();
      this.addBrush();
      this.loading = false;
    },
    addBrush() {
      let brush = d3
        .brush()
        .extent([
          [0, 0],
          [
            this.svgWidth - this.svgPadding.left - this.svgPadding.right,
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          ],
        ])
        .on("end", (e) => {
          this.addBrushedPoints(e);
        })
        .on("start", () => {
          this.hardReset();
          d3.selectAll("circle.point.selected").classed("selected", false);
        });

      d3.select(this.$refs.brush).call(brush);
      this.brush = brush;
    },
    addBrushedPoints(e) {
      let x_0 = e.selection[0][0];
      let x_1 = e.selection[1][0];
      let y_0 = e.selection[0][1];
      let y_1 = e.selection[1][1];

      const selected = [...document.querySelectorAll("circle.point")].filter(
        (el) => {
          const cx = el.getAttribute("cx");
          const cy = el.getAttribute("cy");
          return cx >= x_0 && cx < x_1 && cy >= y_0 && cy < y_1;
        }
      );

      if (selected.length !== 0) {
        selected.forEach((el) => {
          el.classList.add("selected");
          this.$store.commit(
            "SET_SELECTED_STATES",
            selected.map((el) => el.dataset.target)
          );
        });
      } else {
        this.hardReset();
      }
    },
    drawBackground() {
      const rectSide =
        (this.svgWidth - this.svgPadding.left - this.svgPadding.right) / 3;

      d3.select(this.$refs.chartContent)
        .selectAll("rect")
        .data(this.colors)
        .join("rect")
        .attr("fill", (d) => d)
        .attr("width", rectSide)
        .attr("height", rectSide)
        .attr("x", (d, i) => {
          const x = rectSide * (i % 3);
          this.rectangles[i] = { color: d, x_0: x, x_1: x + rectSide };
          return x;
        })
        .attr("y", (d, i) => {
          if (i <= 2) {
            this.rectangles[i].y_0 = 0;
            this.rectangles[i].y_1 = 0 + rectSide;
            return 0;
          }
          if (i > 2 && i <= 5) {
            const y = rectSide * 1;
            this.rectangles[i].y_0 = y;
            this.rectangles[i].y_1 = y + rectSide;
            return y;
          }
          if (i > 5) {
            const y = rectSide * 2;
            this.rectangles[i].y_0 = y;
            this.rectangles[i].y_1 = y + rectSide;
            return y;
          }
        })
        .lower();
    },
    xAxis() {
      const selection = d3.select(this.$refs.x);
      selection
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .call(d3.axisBottom(this.xScale));

      if (!document.querySelector(".x-axis")) {
        selection
          .append("text")
          .attr("class", "axis x-axis")
          .attr("fill", "black")
          .attr("transform", `translate(460,-7)`)
          .attr("text-anchor", "end")
          .text(`${this.$props.labelX}`);
      }
    },
    yAxis() {
      const selection = d3.select(this.$refs.y);
      selection.call(d3.axisLeft(this.yScale));
      if (!document.querySelector(".y-axis")) {
        d3.select(this.$refs.y)
          .append("text")
          .attr("class", "axis y-axis")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .attr("fill", "black")
          .text(`${this.$props.labelY}`);
      }
    },
    plotData() {
      const allStates = [];

      const points = d3.select(this.$refs.points);

      points
        .selectAll(".point")
        .data(this.processedData)
        .join("circle")
        .attr("class", "point")
        .transition()
        .duration(250)
        .attr("cx", (d) => {
          if (this.continent === "US") {
            return this.xScale(d.edu);
          } else {
            return this.xScale(d.vaccinated);
          }
        })
        .attr("cy", (d) => {
          if (this.continent === "US") {
            return this.yScale(d.income);
          } else {
            return this.yScale(d.deaths);
          }
        })
        .attr("data-color", (d) => {
          // color of each state is computed here

          let color = this.computeColor(d);

          if (this.continent === "US") {
            allStates.push({
              state: d.state.replaceAll(" ", ""),
              color: color,
            });
          } else {
            allStates.push({
              state: d.location.replaceAll(" ", ""),
              color: color,
            });
          }
          return color;
        })
        .attr("r", 4.5)
        .attr("data-target", (d) => {
          if (this.continent === "US") {
            return d.state.replaceAll(" ", "");
          }
          {
            return d.location.replaceAll(" ", "");
          }
        });

      // dispatch message for store with computed colors
      this.$store.dispatch("changeAllStates", allStates);

      points
        .selectAll(".point")
        .data(this.processedData)
        .on("mouseover", (e) => {
          this.handleDotHover(e.target.dataset.target);
        })
        .on("mouseout", (e) => {
          this.handleDotHover(e.target.dataset.target);
        })
        .on("click", (e) => this.handleClick(e));

      points
        .selectAll(".point-label")
        .data(this.processedData)
        .join("text")
        .attr("x", (d) => {
          if (this.continent === "US") {
            return this.xScale(d.edu) + 1;
          } else {
            return this.xScale(d.vaccinated) + 1;
          }
        })
        .attr("y", (d) => {
          if (this.continent === "US") {
            return this.xScale(d.edu) + 1;
          } else {
            return this.yScale(d.deaths) - 6;
          }
        })
        .attr("id", (d) => {
          if (this.continent === "US") {
            return `Label${d.state.replaceAll(" ", "")}`;
          } else {
            return `Label${d.location.replaceAll(" ", "")}`;
          }
        })
        .attr("class", "point-label")
        .text((d) => {
          if (this.continent === "US") {
            return d.state;
          } else {
            return d.location;
          }
        });
    },
    handleClick(e) {
      const target = d3.select(e.target);
      if (!target.classed("selected")) {
        target.classed("selected", true);
        this.$store.commit("SET_SELECTED_STATES", [
          ...this.selectedLocations,
          e.target.dataset.target,
        ]);
      }
    },
    computeColor(d) {
      let colorIndex;
      let candidates = [];

      let x;
      let y;

      if (this.continent === "US") {
        x = this.xScale(d.edu);
        y = this.yScale(d.income);
      } else {
        x = this.xScale(d.vaccinated);
        y = this.yScale(d.deaths);
      }

      for (let i = 0; i < this.rectangles.length; i++) {
        // Bigger than starting point and smaller than ending point
        const element = this.rectangles[i];
        if (x >= element.x_0 && x < element.x_1) {
          candidates.push(i);
        }
      }

      candidates.forEach((index) => {
        if (
          y >= this.rectangles[index].y_0 &&
          y <= this.rectangles[index].y_1
        ) {
          colorIndex = index;
        }
      });

      const res = this.rectangles[colorIndex];

      return res.color;
    },
    handleDotHover(target) {
      const targetLabel = d3.select(`#Label${target}`);
      if (targetLabel.classed("active")) {
        targetLabel.classed("active", false);
      } else {
        targetLabel.classed("active", true);
      }
    },
    handleActiveDots(arg) {
      // [data-target="NewJersey"]
      arg.forEach((el) => {
        d3.select(`[data-target="${el.state}"]`).classed("selected", true);
      });
    },
    dataMax(data) {
      return d3.max(data, (d) => d.value);
    },
    dataMin(data) {
      return d3.min(data, (d) => d.value);
    },
    hardReset() {
      // this.brush.clear(d3.select(this.$refs.brush));
      // d3.select(this.$refs.brush).remove();
      d3.select(this.$refs.brush).call(this.brush.move, null);
      d3.selectAll("circle.point.selected").classed("selected", false);
      this.$store.dispatch("reset");
      this.constructChart();
    },
  },
  // reactive data
  computed: {
    data: {
      get() {
        return this.$store.getters.data;
      },
    },
    datasetY: {
      get() {
        // {state: 'Alabama', value: 21.1}
        return this.$store.getters.educationRates;
      },
    },
    datasetX: {
      // {state: 'Alabama', value: '31474'}
      get() {
        return this.$store.getters.personalIncome;
      },
    },
    selectedLocations: {
      get() {
        // TODO states vs countries
        return this.$store.getters.selectedStates;
      },
    },
    allStates: {
      get() {
        return this.$store.getters.allStates;
      },
    },
    merged() {
      return this.datasetY.map((el, i) => {
        return {
          state: el.state,
          income: parseInt(el.value),
          edu: parseInt(this.datasetX[i].value),
        };
      });
    },
    allCountries: {
      get() {
        return this.$store.getters.allCountries;
      },
    },
    xScale() {
      let domain;
      if (this.continent === "US") {
        domain = [
          this.dataMin(this.datasetX) * 0.95,
          this.dataMax(this.datasetX) * 1.05,
        ];
      } else {
        domain = [
          0,
          d3.max(this.processedData.map((el) => el.vaccinated)) * 1.1,
        ];
      }
      return d3
        .scaleLinear()
        .rangeRound([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ])
        .domain(domain);
    },
    yScale() {
      let domain;
      if (this.continent === "US") {
        domain = [
          this.dataMin(this.datasetY) * 0.95,
          parseInt(this.dataMax(this.datasetY)) * 1.05,
        ];
      } else {
        domain = [0, d3.max(this.processedData.map((el) => el.deaths)) * 1.1];
      }
      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain(domain);
    },
    processedData() {
      let processed;
      if (this.continent === "US") {
        processed = this.merged;
      } else {
        processed = this.data.filter(
          (el) => !isNaN(el.deaths) && el.date === "12-12-21"
        );
      }
      // console.log('processed :>> ', processed);
      // TOP: 12-12-21, 23-05-21, 18-05-21, 26-03-21

      // computing best dates
      // let allWithAll = this.allCountries.map((el) => {
      //   return {
      //     location: el,
      //     data: this.data.filter((ele) => ele.location === el),
      //   };
      // });

      // let max = 0;
      // let ele;

      // allWithAll.forEach((el) => {
      //   if (el.data.length > max) {
      //     ele = el;
      //     max = el.data.length;
      //   }
      // });

      // let allDates = ele.data.map((el) => el.date);

      // let res = [];
      // let temp = [];
      // let dis = [];

      // allDates.forEach(
      //   (date) => {
      //     temp = this.data.filter((el) => el.date === date)
      //     if(temp.length > res.length){
      //       res = temp
      //       dis.push(temp)
      //     }
      //   }
      // );

      return processed;
    },
    continent: {
      get() {
        return this.$store.getters.continent;
      },
    },
  },
  watch: {
    continent: {
      handler() {
        this.loading = true;
        d3.select(this.$refs.points).html("");
        this.xAxis();
        this.yAxis();
        this.plotData();
        this.addBrush();
        this.loading = false;
      },
    },
    data: {
      handler() {
        this.constructChart();
      },
    },
    selectedLocations: {
      handler() {
        this.handleActiveDots(
          this.allStates.filter((el) =>
            this.selectedLocations.includes(el.state)
          )
        );
      },
    },
  },
};
</script>

<style>
svg {
  filter: drop-shadow(2px 4px 6px #00000026);
}

.point-label {
  display: none;
  outline: 1px solid black;
  font-weight: bold;
  fill: rgb(255 255 255);
  filter: drop-shadow(0px 0px 2px black);
  stroke: black;
  stroke-width: 0.2;
}

.point {
  fill: rgba(255, 255, 255, 0.5);
  stroke-width: 1.5;
  stroke: black;
}

.point:hover {
  fill: black;
  stroke: white;
  cursor: pointer;
}

.point.selected {
  fill: #000000;
  filter: drop-shadow(0px 0px 6px #ffffff);
  stroke-width: 2.5;
}

.active {
  display: block !important;
  overflow: visible;
}

.main-svg {
  overflow: visible;
}

.point-label__background {
  fill: white;
}

.axis {
  font-weight: bold;
}
</style>
