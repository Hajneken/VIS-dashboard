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
    allCountries: [],
    timeFrame: [],
    selectedStates: [],
    educationRates: [],
    personalIncome: [],
    continent: "EU",
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

        let filtered = data.map(el => {
          return {
            location: el.location,
            date: el.date,
            cases: el.new_cases_per_million,
            hospitalized: el.hosp_patients_per_million,
            vaccinated: el.people_fully_vaccinated_per_hundred,
            diabetes: el.diabetes_prevalence,
            aged: el.aged_65_older,
            poverty: el.extreme_poverty,
            deaths: el.total_deaths_per_million,
            femSmokers: el.female_smokers,
            malSmokers: el.male_smokers,
          }
        })
          .filter(el => (el.vaccinated !== '')).map(el => {
            return {
              location: el.location,
              date: el.date,
              cases: parseFloat(el.cases),
              hospitalized: parseFloat(el.hospitalized),
              vaccinated: parseFloat(el.vaccinated),
              diabetes: parseFloat(el.diabetes),
              aged: parseFloat(el.aged),
              poverty: parseFloat(el.poverty),
              deaths: parseFloat(el.deaths),
              femSmokers: parseFloat(el.femSmokers),
              malSmokers: parseFloat(el.malSmokers),
            }
          })

        // find all countries in dataset
        state.allCountries = [... new Set(
          filtered.map(el => el.location)
        )]
        state.data = filtered
        // ['location', 'date', 'total_cases', 'new_cases', 'new_cases_smoothed', 'total_deaths', 'new_deaths', 'new_deaths_smoothed', 'total_cases_per_million', 'new_cases_per_million', 'new_cases_smoothed_per_million', 'total_deaths_per_million', 'new_deaths_per_million', 'new_deaths_smoothed_per_million', 'reproduction_rate', 'icu_patients', 'icu_patients_per_million', 'hosp_patients', 'hosp_patients_per_million', 'weekly_icu_admissions', 'weekly_icu_admissions_per_million', 'weekly_hosp_admissions', 'weekly_hosp_admissions_per_million', 'new_tests', 'total_tests', 'total_tests_per_thousand', 'new_tests_per_thousand', 'new_tests_smoothed', 'new_tests_smoothed_per_thousand', 'positive_rate', 'tests_per_case', 'tests_units', 'total_vaccinations', 'people_vaccinated', 'people_fully_vaccinated', 'total_boosters', 'new_vaccinations', 'new_vaccinations_smoothed', 'total_vaccinations_per_hundred', 'people_vaccinated_per_hundred', 'people_fully_vaccinated_per_hundred', 'total_boosters_per_hundred', 'new_vaccinations_smoothed_per_million', 'new_people_vaccinated_smoothed', 'new_people_vaccinated_smoothed_per_hundred', 'stringency_index', 'population', 'population_density', 'median_age', 'aged_65_older', 'aged_70_older', 'gdp_per_capita', 'extreme_poverty', 'cardiovasc_death_rate', 'diabetes_prevalence', 'female_smokers', 'male_smokers', 'handwashing_facilities', 'hospital_beds_per_thousand', 'life_expectancy', 'human_development_index', 'excess_mortality_cumulative_absolute', 'excess_mortality_cumulative', 'excess_mortality', 'excess_mortality_cumulative_per_million']
      })

      d3.csv('./usa_ba-degree-or-higher_2006-2019.csv').then((data) => {
        // shape of data: 0 to nth-1 == years, nth == state
        // console.log("freshly retrieved data", data)
        state.educationRates = data;
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
    allCountries: (state) => state.allCountries,
    timeFrame: (state) => state.timeFrame,
    data: (state) => state.data,
    raw(state) {
      if (state.continent === "US") {
        const res = state.educationRates.map(el => Object.entries(el).map(el => { return { year: el[0], value: el[1] } }))

        return res.map(el => {
          return {
            state: el.filter(el => el.year === "State")[0].value,
            data: el.filter(el => el.year !== "State")
          }
        })
      } else {
        const countries = state.allCountries

        const occurences = countries.map(el => {
          return {
            name: el,
            count: state.data.filter(ele => ele.location === el).length
          }
        })
        // get the least using Math.min(...items)
        let least = 500;
        let country;
        let dates;
        let finalData;
        for (let i = 0; i < occurences.length; i++) {
          const element = occurences[i];
          if (element.count < least) {
            country = element
            least = element.count
          }
        }

        const filteredData = countries.map(el => {
          return {
            state: el,
            data: state.data.filter(ele => ele.location === el).map(elem => {
              return {
                year: elem.date,
                value: parseFloat(elem.vaccinated)
              }
            })
          }
        })

        if (country) {
          // send dates 
          let parseTime = d3.timeParse("%d-%m-%y")
          // get dates of the least 
          dates = filteredData.filter(el => el.state === country.name)[0].data.map(el => el.year)
          // filter the filteredData if they include the same dates
          let processing = filteredData.map(el => {
            return {
              state: el.state,
              data: el.data.filter(ele => dates.includes(ele.year)).map(el => { return { year: parseTime(el.year), value: el.value } })
            }
          })
          // filter the final 
          finalData = processing.filter(el => el.data.length === 19)
        }

        return finalData
      }
    }
    ,
    educationRates(state) {
      let result = [];
      for (let i = 0; i < state.educationRates.length; i++) {
        if (state.selectedYear in state.educationRates[i]) {
          result.push({
            state: state.educationRates[i].State,
            value: +state.educationRates[i][state.selectedYear]
          })
        }
      }
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
