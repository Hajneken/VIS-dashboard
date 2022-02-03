<template>
  <div class="vis-component" ref="chart">
    <h2 class="mb-4">{{ header }}</h2>
    <div v-if="loading">
      <b-spinner variant="primary" label="Spinning"></b-spinner>
    </div>
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
          ><abbr
            title="Diabetes prevalence (% of population aged 20 to 79) in 2017"
            >Diabetes</abbr
          ></b-form-checkbox
        >
      </b-badge>
      <b-badge variant="danger" class="mr-3">
        <b-form-checkbox v-model="class2Checked" name="class2" size="lg"
          ><abbr title="Share of women who smoke, most recent year available"
            >Smokers Female</abbr
          ></b-form-checkbox
        >
      </b-badge>
      <b-badge variant="warning" class="mr-3">
        <b-form-checkbox v-model="class3Checked" name="class3" size="lg"
          ><abbr title="Share of men who smoke, most recent year available"
            >Smokers Male</abbr
          ></b-form-checkbox
        >
      </b-badge>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "BarChart",
  props: ["header", "labelY"],
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
      loading: true,
    };
  },
  mounted() {
    // this.drawChart();
  },
  methods: {
    drawChart() {
      this.loading = true;
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawXAxis();
      this.drawYAxis();
      this.drawBars();
      this.loading = false;
    },
    redraw() {
      // change Y axis
      this.loading = true;
      if (this.continent === "US") {
        d3.select("#BarchartXLabel").text("US state shares in %");
      } else {
        d3.select("#BarchartXLabel").text(`${this.$props.labelY}`);
      }
      d3.select(this.$refs.axisX)
        .transition()
        .duration(800)
        .call(d3.axisBottom(this.xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", -7)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");

      d3.select(this.$refs.axisY)
        .transition()
        .duration(800)
        .call(d3.axisLeft(this.yScale).tickSize(-this.svgWidth));
      this.loading = false;
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
        .attr("id", "BarchartXLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text(`${this.$props.labelY}`);
    },
    drawBars() {
      let mock;

      if (this.continent === "US") {
        mock = this.educationRates.map((el) => {
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
        }
      } else {
        mock = this.processedData.map((el) => {
          return {
            state: el.location,
            dataset1: el.diabetes,
            dataset2: el.femSmokers,
            dataset3: el.malSmokers,
          };
        });

        if (this.selectedStates.length !== 0) {
          mock = this.processedData
            .map((el) => {
              return {
                state: el.location,
                dataset1: el.diabetes,
                dataset2: el.femSmokers,
                dataset3: el.malSmokers,
              };
            })
            .filter((el) => {
              return this.selectedStates.includes(el.state.replaceAll(" ", ""));
            });
        }
      }

      this.xScale.domain(mock.map((el) => el.state));

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
    continent: {
      get() {
        return this.$store.getters.continent;
      },
    },
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
      let domain;
      if (this.continent === "US") {
        domain = this.educationRates.map((d) => d.state);
      } else {
        // europe
        domain = this.processedData.map((d) => d.location);
      }

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
      let domain;

      if (this.continent === "US") {
        domain = [this.dataMin > 0 ? 0 : this.dataMin, this.dataMax * 1.5];
      } else {
        // europe
        domain = [
          0,
          d3.max(this.processedData.map((el) => el.femSmokers)) * 1.5,
        ];
      }

      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain(domain);
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
    data: {
      get() {
        return this.$store.getters.data;
      },
    },
    processedData() {
      const processed = this.data.filter(
        (el) =>
          Number.isNaN(el.diabetes) === false &&
          Number.isNaN(el.femSmokers) === false &&
          Number.isNaN(el.malSmokers) === false &&
          el.date === "10-10-21"
      );
      // 10-10-21 best I can do
      return processed;
    },
  },
  watch: {
    data: {
      handler() {
        this.drawChart();
      },
    },
    continent: {
      handler() {
        this.redraw();
      },
    },
    educationRates: {
      handler() {
        this.redraw();
      },
      deep: true,
    },
    personalIncome: {
      handler() {
        this.redraw();
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
        // console.log('selectedStates :>> ', this.selectedStates);
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
