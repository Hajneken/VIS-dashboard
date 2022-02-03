<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <h2>{{ header }}</h2>
      <p>
        <strong>Hold Click &amp; Drag</strong> (<abbr
          title="Fancy name for drawing a rectangular area with a mouse."
          >brush</abbr
        >) over the points or <strong>click</strong> them to color states in the
        map.
      </p>
      <p>
        showing date:
        <abbr
          title="Date purposefully chosen to caputure statistics released on the same day by as many countries as possible"
          ><strong>{{ this.processedData[0].date }}</strong>
        </abbr>
      </p>
    </div>
    <svg ref="chart" class="main-svg mb-4" :width="svgWidth" :height="svgHeight">
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
        v-on:click.prevent="reset()"
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
      rectangles: [],
      brush: [],
    };
  },
  mounted() {
    this.constructChart();
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
        .on("brush end", (e) => {
          this.addBrushedPoints(e);
        });

      d3.select(this.$refs.brush).call(brush);
      this.brush.push(brush);
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
        this.reset();
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
      selection.call(d3.axisLeft(this.yScale).tickFormat((d) => d / 1000));
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
          return this.xScale(d.vaccinated);
        })
        .attr("cy", (d) => {
          return this.yScale(d.deaths);
        })
        .attr("data-color", (d) => {
          // color of each state is computed here
          let color = this.computeColor(d);
          allStates.push({
            state: d.location.replaceAll(" ", ""),
            color: color,
          });
          return color;
        })
        .attr("r", 4.5)
        .attr("data-target", (d) => d.location.replaceAll(" ", ""));

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
        .attr("x", (d) => this.xScale(d.vaccinated) + 1)
        .attr("y", (d) => this.yScale(d.deaths) - 6)
        .attr("id", (d) => `Label${d.location.replaceAll(" ", "")}`)
        .attr("class", "point-label")
        .text((d) => d.location);
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

      let x = this.xScale(d.vaccinated);
      let y = this.yScale(d.deaths);

      for (let i = 0; i < this.rectangles.length; i++) {
        // Bigger than starting point and smaller than ending point
        const element = this.rectangles[i];
        if (x >= element.x_0 && x < element.x_1) {
          candidates.push(i);
        }
      }

      candidates.forEach((index) => {
        if (y >= this.rectangles[index].y_0 && y < this.rectangles[index].y_1) {
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
    reset() {
      d3.selectAll("circle.point.selected").classed("selected", false);
      this.$store.dispatch("reset");
      this.constructChart();
      d3.select(this.$refs.brush).call(this.brush[0].move, null);
      this.brush = [];
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
    allCountries: {
      get() {
        return this.$store.getters.allCountries;
      },
    },
    xScale() {
      return d3
        .scaleLinear()
        .rangeRound([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ])
        .domain([
          // d3.min(this.data.map((el) => el.vaccinated)) * 0.95,
          0,
          d3.max(this.processedData.map((el) => el.vaccinated)) * 1.1,
        ]);
    },
    yScale() {
      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([
          // d3.min(this.data.map((el) => el.deaths)) * 0.95,
          0,
          d3.max(this.processedData.map((el) => el.deaths)) * 1.1,
        ]);
    },
    processedData() {
      // TODO process, sum and stuff 31-10-21
      // console.log('this.data :>> ', this.data);
      // console.log('test ', this.data.filter(el => !isNaN(el.deaths)));
      // console.log(
      //   "this.data.filter((el) => !isNaN(el.deaths)) :>> ",
      //   this.data.filter((el) => !isNaN(el.deaths))
      // );

      // give me all countries so that each is represented as a dot

      return this.data.filter(
        (el) => !isNaN(el.deaths) && el.date === "03-12-21"
      );
    },
  },
  watch: {
    data: {
      handler() {
        this.constructChart();
      },
    },
    datasetY: {
      handler() {
        // console.log("this.datasetY :>> ", this.datasetY);
        this.constructChart();
      },
      deep: true,
    },
    datasetX: {
      handler() {
        // console.log("this.datasetX :>> ", this.datasetX);
        this.constructChart();
      },
      deep: true,
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
