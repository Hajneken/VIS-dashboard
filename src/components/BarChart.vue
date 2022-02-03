<template>
  <div class="vis-component" ref="chart">
    <h2 class="mb-4">Barchart</h2>
    <svg id="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="bars-group" ref="barsGroup"></g>
      </g>
    </svg>

    <div class="d-flex justify-content-center align-items-center mt-2">
      <p class="mb-0 mr-3 font-weight-bold">Toggle Displayed:</p>
      <b-badge variant="primary" class="mr-3">
        <b-form-checkbox
          v-model="class1Checked"
          name="class1"
          size="lg"
          variant="danger"
          >Class A</b-form-checkbox
        >
      </b-badge>
      <b-badge variant="danger" class="mr-3">
        <b-form-checkbox v-model="class2Checked" name="class2" size="lg"
          >Class B</b-form-checkbox
        >
      </b-badge>
      <b-badge variant="warning" class="mr-3">
        <b-form-checkbox v-model="class3Checked" name="class3" size="lg"
          >Class C</b-form-checkbox
        >
      </b-badge>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BarChart",
  props: ["labelY"],
  data() {
    return {
      svgWidth: 0,
      svgHeight: 550,
      svgPadding: {
        top: 25,
        right: 20,
        bottom: 100,
        left: 40,
      },
      class1Checked: true,
      class2Checked: true,
      class3Checked: true,
    };
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawXAxis();
      this.drawYAxis();
      this.drawBars();
    },
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .transition()
        .duration(800)
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -7)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");
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
    drawBars() {
      let mock = this.educationRates.map((el) => {
        return {
          state: el.state,
          dataset1: el.value,
          dataset2: el.value * 0.8,
          dataset3: el.value * 0.2,
        };
      });

      if (this.selectedStates.length !== 0) {
        mock = this.educationRates
          .map((el) => {
            return {
              state: el.state,
              dataset1: el.value,
              dataset2: el.value * 0.8,
              dataset3: el.value * 0.2,
            };
          })
          .filter((el) =>
            this.selectedStates.includes(el.state.replaceAll(" ", ""))
          );

        this.xScale.domain(mock.map((el) => el.state));
      }

      // adopted from https://www.d3-graph-gallery.com/graph/barplot_grouped_basicWide.html
      d3.select(this.$refs.barsGroup)
        .selectAll("g")
        .data(mock)
        .join("g")
        .attr("transform", (d) => `translate(${this.xScale(d.state)}, 0)`)
        .selectAll("rect")
        .data((d) => {
          return this.classes.map((key) => {
            return { key: key, value: d[key] };
          });
        })
        .join("rect")
        .transition()
        .duration(800)
        .attr("x", (d) => this.xClass(d.key))
        .attr("y", (d) => this.yScale(d.value))
        .attr("width", this.xClass.bandwidth())
        .attr(
          "height",
          (d) =>
            this.svgHeight -
            this.svgPadding.top -
            this.svgPadding.bottom -
            this.yScale(d.value)
        )
        .attr("fill", (d) => this.color(d.key));

        this.drawXAxis();

      d3.select(this.$refs.axisY).selectAll("text").raise();
    },
    handleBarClick(val) {
      this.$store.commit("CHANGE_SELECTED_STATE", val);
    },
  },
  computed: {
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
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
    dataMax() {
      return d3.max(this.educationRates, (d) => d.value);
    },
    dataMin() {
      return d3.min(this.educationRates, (d) => d.value);
    },
    xScale() {
      let domain = this.educationRates.map((d) => d.state);

      if (this.selectedStates.length !== 0) {
        domain = this.selectedStates;
      }

      return d3
        .scaleBand()
        .rangeRound([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ])
        .padding(0.1)
        .domain(domain);
    },
    yScale() {
      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
    },
    groups() {
      // countries -> labels on x axis
      return this.educationRates.map((d) => d.state);
    },
    classes() {
      let dataSets = [];
      this.class1Checked && dataSets.push("dataset1");
      this.class2Checked && dataSets.push("dataset2");
      this.class3Checked && dataSets.push("dataset3");
      // here pass different data
      return dataSets;
    },
    color() {
      let colors = [];
      this.class1Checked && colors.push("#007bff");
      this.class2Checked && colors.push("#dc3545");
      this.class3Checked && colors.push("#ffc107");
      return d3.scaleOrdinal().domain(this.classes).range(colors);
    },
    xClass() {
      return d3
        .scaleBand()
        .domain(this.classes)
        .range([0, this.xScale.bandwidth()])
        .padding([0.2]);
    },
  },
  watch: {
    educationRates: {
      handler() {
        this.drawChart();
      },
      deep: true,
    },
    personalIncome: {
      handler() {
        this.drawChart();
      },
    },
    class1Checked: {
      handler() {
        this.drawBars();
      },
    },
    class2Checked: {
      handler() {
        this.drawBars();
      },
    },
    class3Checked: {
      handler() {
        this.drawBars();
      },
    },
    selectedStates: {
      handler() {
        this.drawBars();
      },
    },
  },
};
</script>

<style>
.bar {
  fill: steelblue;
}

.bar:hover {
  fill: lightblue;
}
</style>
