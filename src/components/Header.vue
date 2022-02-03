<template>
  <header>
    <div>
      <b-button v-b-toggle.collapse-1 variant="primary"
        ><b-icon icon="info-circle" variant="light"></b-icon> About <b-icon icon="chevron-down" variant="light"></b-icon
      ></b-button>
      <b-collapse id="collapse-1" class="mt-2 author">
        <b-card class="border-0">
          <ul>
            <li>
              <strong
                ><abbr title="Visualisation and Visual Data Analysis">VIS</abbr>
                - Assignment {{ assignmentNum }}: Dashboard
              </strong>
            </li>
            <li>
              student:
              <a href="mailto:a12010957@unet.univie.ac.at">Hynek Zemanec</a>
            </li>
            <li>semester: WS2021</li>
            <li>
              <a
                target="_blank"
                href="http://vda.univie.ac.at/Teaching/Vis/21w/a5.html"
                >Assignment Instructions</a
              >
            </li>
            <li>
              <a href="https://devdocs.io/d3~6/" target="_blank"
                >D3 v6 Documentation</a
              >
            </li>
          </ul>
        </b-card>
      </b-collapse>
    </div>
    <div class="custom-center d-flex flex-column align-items-center">
      <h1>COVID-19 Analytics</h1>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  props: ["assignmentNum"],
  methods: {
    reset() {
      this.$store.dispatch("reset");
    },
  },
};
</script>

<style>
h1 {
  margin: 0 auto;
  font-size: 4.8rem !important;
}

header {
  display: flex !important;
  align-items: center;
}

ul {
  box-shadow: 5px 6px 8px 1px #0000001f;
  display: flex;
  flex-direction: column;
  max-width: 230px;
  padding: 1.2rem;
  list-style-type: none;
  /* margin: 0 auto; */
}

ul li {
  margin-bottom: 0.8rem;
}

.custom-center {
  margin-left: 27%;
}

</style>