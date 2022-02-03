import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';
// import { componentsPlugin } from 'bootstrap-vue';

Vue.use(Vuex);

const store = new Vuex.Store({
  // Filter Data
  state: {
    selectedYear: 2006,
    allStates: [],
    timeFrame: [],
    selectedStates: [],
    educationRates: [],
    personalIncome: [],
    continent: "USA",
    raw: [],
    data: []
  },
  // methods for mutating from within the components 
  mutations: {
    CHANGE_SELECTED_YEAR(state, year) {
      state.selectedYear = year;
    },
    // TODO consider changing to Location
    CHANGE_SELECTED_STATE(state, val) {
      state.selectedStates.push(val);
    },
    SET_SELECTED_STATES(state, val) {
      state.selectedStates = val
    },
    SET_CONTINENT(state, val) {
      state.continent = val
    },
    SET_ALL_STATES(state, val) {
      state.allStates = val
    },
    SET_TIME_FRAME(state, val) {
      state.timeFrame = val
    }
  },
  // actions only exists so that we can execute asynchronous actions
  actions: {
    loadData({ state }) {
      d3.csv('./covid-data-europe-filtered.csv').then((data) => {
        "total_cases_per_million"
        let filtered = data.map(el => {
          return {
            location: el.location,
            date: el.date,
            cases: el.total_cases_per_million,
            hospitalized: el.total_cases_per_million
          }
        })
          .filter(el => el.date === "29-10-21")

        // console.log('filtered :>> ', filtered);

        // console.log(data.columns);
        // ['location', 'date', 'total_cases', 'new_cases', 'new_cases_smoothed', 'total_deaths', 'new_deaths', 'new_deaths_smoothed', 'total_cases_per_million', 'new_cases_per_million', 'new_cases_smoothed_per_million', 'total_deaths_per_million', 'new_deaths_per_million', 'new_deaths_smoothed_per_million', 'reproduction_rate', 'icu_patients', 'icu_patients_per_million', 'hosp_patients', 'hosp_patients_per_million', 'weekly_icu_admissions', 'weekly_icu_admissions_per_million', 'weekly_hosp_admissions', 'weekly_hosp_admissions_per_million', 'new_tests', 'total_tests', 'total_tests_per_thousand', 'new_tests_per_thousand', 'new_tests_smoothed', 'new_tests_smoothed_per_thousand', 'positive_rate', 'tests_per_case', 'tests_units', 'total_vaccinations', 'people_vaccinated', 'people_fully_vaccinated', 'total_boosters', 'new_vaccinations', 'new_vaccinations_smoothed', 'total_vaccinations_per_hundred', 'people_vaccinated_per_hundred', 'people_fully_vaccinated_per_hundred', 'total_boosters_per_hundred', 'new_vaccinations_smoothed_per_million', 'new_people_vaccinated_smoothed', 'new_people_vaccinated_smoothed_per_hundred', 'stringency_index', 'population', 'population_density', 'median_age', 'aged_65_older', 'aged_70_older', 'gdp_per_capita', 'extreme_poverty', 'cardiovasc_death_rate', 'diabetes_prevalence', 'female_smokers', 'male_smokers', 'handwashing_facilities', 'hospital_beds_per_thousand', 'life_expectancy', 'human_development_index', 'excess_mortality_cumulative_absolute', 'excess_mortality_cumulative', 'excess_mortality', 'excess_mortality_cumulative_per_million']

        state.data = filtered
      })

      d3.csv('./usa_ba-degree-or-higher_2006-2019.csv').then((data) => {
        // shape of data: 0 to nth-1 == years, nth == state
        // console.log("freshly retrieved data", data)
        state.educationRates = data;
        state.raw = data;
      })

      d3.csv('./usa_personal-income-by-state_2006-2019.csv').then((data) => {
        state.personalIncome = data;
      })
    },
    reset() {
      this.commit('SET_SELECTED_STATES', [])
    },
    changeContinent(state, payload) {
      // best practice to properly commit a mutation
      this.commit('SET_CONTINENT', payload)
    },
    changeAllStates(state, payload) {
      this.commit("SET_ALL_STATES", payload)
    }
  },
  // getters for getting data from within the components 
  getters: {
    continent: (state) => state.continent,
    selectedYear: (state) => state.selectedYear,
    selectedStates: (state) => state.selectedStates,
    allStates: (state) => state.allStates,
    timeFrame: (state) => state.timeFrame,
    // cases: "64164.37"
    // date: "29-10-21"
    // hospitalized: "64164.37"
    // location: "Albania"
    data: (state) => state.data,
    raw(state) {
      const res = state.raw.map(el => Object.entries(el).map(el => { return { year: el[0], value: el[1] } }))

      return res.map(el => {
        return {
          state: el.filter(el => el.year === "State")[0].value,
          data: el.filter(el => el.year !== "State")
        }
      })
    },
    // educationRates
    educationRates(state) {
      // console.log("STATE", state.educationRates)
      let result = [];
      // TODO HERE uncomment to unbreak :)
      for (let i = 0; i < state.educationRates.length; i++) {
        if (state.selectedYear in state.educationRates[i]) {
          result.push({
            state: state.educationRates[i].State,
            value: +state.educationRates[i][state.selectedYear]
          })
        }
      }
      // {state: 'Alabama', value: 21.1}

      return result;
    },
    personalIncome(state) {
      let result = [];
      for (let i = 0; i < state.personalIncome.length; i++) {
        if (state.selectedYear in state.personalIncome[i]) {
          result.push({
            state: state.personalIncome[i].State,
            value: state.personalIncome[i][state.selectedYear]
          })
        }
      }
      return result;
    },
  }
})

export default store;
