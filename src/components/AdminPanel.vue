<template>
    <v-container fluid>
        <v-card>
            <v-card-title>
                Temperature submissions
                <v-spacer/>
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
            </v-card-title>
            <v-card-subtitle>
                <v-container fluid>
                    <v-row>
                        <v-select
                                v-model="selectedMentorGroup"
                                :items="mentorGroups"
                                label="Mentor Group"
                        />
                        <v-switch
                                class="mx-8"
                                v-model="todayOnly"
                                label="Today only"
                        />
                        <v-spacer/>
                    </v-row>
                </v-container>
            </v-card-subtitle>
            <v-data-table
                    item-key="timestamp"
                    :items="filteredData==null ? [] : filteredData"
                    :headers="headers"
                    :loading="filteredData==null"
                    :loading-text="fetchError ? fetchError : 'Loading...'"
                    :search="search"
            >
                <template v-slot:item.temperature="{ item }">
                    <v-chip :color="getTemperatureColor(item.temperature)" dark>{{ item.temperature }}</v-chip>
                </template>
                <template v-slot:item.timestamp="{ item }">
                    {{ formatDate(new Date(item.timestamp)) }}
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
  export default {
    name: 'AdminPanel',
    data: function () {
      return {
        headers: [
          {text: "Timestamp", value: "timestamp", divider: true, width: '10%'},
          {text: "Class", value: "mentorGroup", sortable: false},
          {text: "Name", value: "name"},
          {text: "Temperature", value: "temperature"},
        ],
        mentorGroups: ["All", ...Array.from(Array(8).keys()).splice(1)
          .map(a => {
            return `M2040${a}`
          })],
        selectedMentorGroup: "All",
        fetchError: false,
        fetchedData: null,
        todayOnly: false,
        search: ""
      };
    },
    computed: {
      filteredData: function () {
        let filtered = this.fetchedData
        if (filtered == null) return null
        const today = new Date().toDateString()
        filtered = filtered.filter(a => {
          if (this.todayOnly) {
            const date = new Date(a.timestamp)
            if (date.toDateString() !== today) return false
          }
          if (this.selectedMentorGroup !== "All") {
            if (a.mentorGroup !== this.selectedMentorGroup) return false
          }
          return true
        })
        return filtered
      }
    },
    created() {
      this.fetchData("")
    },
    methods: {
      async fetchData() {
        return fetch(`https://temperature.chatbox2.ml/api/temperatures/all`, {
          credentials: "include"
        })
          .then(a => a.text())
          .then(text => {
            try {
              this.fetchedData = JSON.parse(text).map(item => {
                return {
                  temperature: item.temperature.temperature,
                  timestamp: item.timestamp,
                  email: item.email,
                  name: item.name,
                  mentorGroup: item.mentorGroup
                }
              })
              this.fetchError = false
            } catch (e) {
              this.fetchError = e.toString()
              this.fetchedData = null
            }
          })
          .catch(e => {
            this.fetchError = e.toString()
            this.fetchedData = null
          })
      },

      getTemperatureColor(temperature) {
        if (temperature >= 37.4)
          return 'red'
        else if (temperature < 35)
          return 'blue'
        else
          return 'green'
      },
      formatDate(date) {
        const dtf = new Intl.DateTimeFormat('en', {
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        })
        const [{value: mo}, , {value: da}, , {value: hour}, , {value: minute}, , , , {value: dayPeriod}] = dtf.formatToParts(date)
        return `${da} ${mo} ${hour}:${minute} ${dayPeriod}`
      }
    }

  }
</script>
<style>
    .v-select__selections input {
        display: none
    }
</style>
