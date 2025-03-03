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
                        <v-col cols="6">
                            <v-select
                                    dense
                                    v-model="selectedMentorGroup"
                                    :items="mentorGroups"
                                    label="Mentor Group"
                            />
                        </v-col>
                        <v-switch
                                class="mx-4"
                                v-model="todayOnly"
                                label="Today only"
                        />
                        <v-switch
                                class="mx-4"
                                v-show="todayOnly && selectedMentorGroup !== 'All'"
                                v-model="showNoSubmit"
                                label="Show all students"
                        />

                        <v-spacer/>
                        <v-btn
                                :disabled="filteredData==null || filteredData.length===0"
                                color="primary"
                                class="my-2"
                                @click="downloadCSV"
                        >
                            <v-icon left>mdi-download</v-icon>
                            Download
                        </v-btn>
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
                    <v-chip :color="getTemperatureColor(item.temperature)" dark>
                        {{ item.temperature == null ? "Not submitted" : item.temperature }}
                    </v-chip>
                </template>
                <template v-slot:item.timestamp="{ item }">
                    {{ item.timestamp == null ? "-" :
                    dateutils.displayDate(dateutils.parseDateLocalTime(item.timestamp)) }}
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
  import dateutils from "@/utils/dateutils";

  export default {
    name: 'AdminPanel',
    data: function () {
      return {
        dateutils,
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
        todayOnly: true,
        showNoSubmit: false,
        todayData: null,
        todayError: false,
        search: ""
      };
    },
    computed: {
      filteredData: function () {
        let filtered = this.todayOnly ? (this.todayData != null ? this.todayData : this.fetchedData) : this.fetchedData
        if (filtered == null) return null
        const today = new Date().toDateString()
        filtered = filtered.filter(a => {
          if (this.todayOnly && this.todayData == null) {
            const date = dateutils.parseDateLocalTime(a.timestamp)
            if (date.toDateString() !== today) return false
          }
          if (this.selectedMentorGroup !== "All") {
            if (a.mentorGroup !== this.selectedMentorGroup) return false
          }
          return true
        })
        if (this.selectedMentorGroup !== "All" && this.todayOnly && this.showNoSubmit) {
          const ids = filtered.map(a => a.email)
          this.classlist.forEach(a => {
            if (!ids.includes(a.id)) {
              filtered = [...filtered, {
                temperature: null,
                timestamp: null,
                email: a.id,
                name: a.name,
                mentorGroup: a.mentorGroup
              }]
            }
          })
        }
        return filtered
      }
    },
    asyncComputed: {
      classlist: {
        lazy: true,
        default: [],
        get() {
          if (this.selectedMentorGroup === "All") return []
          return fetch(`https://temperature.chatbox2.ml/api/classes/${this.selectedMentorGroup}`, {
            credentials: "include"
          }).then(a => a.json())
        }
      }
    },
    created() {
      this.fetchData()
      this.listenToday()
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
              }).sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp)
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
        if (temperature == null) return 'orange'
        if (temperature >= 37.4)
          return 'red'
        else if (temperature < 35)
          return 'blue'
        else
          return 'green'
      },
      listenToday() {
        const websocket = new WebSocket("wss://temperature.chatbox2.ml/api/temperatures/today/watch")
        websocket.onmessage = data => {
          if (data.data.includes("keepalive")) return
          try {
            this.todayData = JSON.parse(data.data).map(item => {
              return {
                temperature: item.temperature.temperature,
                timestamp: item.timestamp,
                email: item.email,
                name: item.name,
                mentorGroup: item.mentorGroup
              }
            })
            this.todayError = false
          } catch (e) {
            this.todayData = null
            this.todayError = e.toString()
          }
        }
      },
      downloadCSV() {
        let output = "data:text/csv;charset=utf-8,Timestamp,Class,Name,Temperature\n"
        for (const item of this.filteredData) {
          const timestamp = item.timestamp == null ? "-" : dateutils.displayDate(dateutils.parseDateLocalTime(item.timestamp))
          const temperature = item.temperature == null ? "Not submitted" : item.temperature
          output += `${timestamp},${item.mentorGroup},"${item.name}",${temperature}\n`
        }
        const fileName = (this.selectedMentorGroup === "All" ? "Year 4" : this.selectedMentorGroup) + "-" +
          (this.todayOnly ? new Date().toDateString() : "All") + ".csv"
        const encodedUri = encodeURI(output);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link); // Required for FF

        link.click();
      }
    }

  }
</script>
<style>
    .v-select__selections input {
        display: none
    }
</style>
