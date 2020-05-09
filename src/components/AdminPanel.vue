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
            <v-data-table
                    item-key="timestamp"
                    :items="fetchedData==null ? [] : fetchedData"
                    :headers="headers"
                    :loading="fetchedData==null"
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
          {text: "Timestamp", value: "timestamp"},
          {text: "Email", value: "email"},
          {text: "Temperature", value: "temperature"}
        ],
        fetchError: false,
        fetchedData: null,
        search: ""
      };
    },
    created() {
      this.fetchData("")
    },
    methods: {
      async fetchData(queryParams) {
        return fetch(`https://temperature.chatbox2.ml/api/temperatures/all?${queryParams}`, {
          credentials: "include"
        })
          .then(a => a.text())
          .then(text => {
            try {
              this.fetchedData = JSON.parse(text).map(item => {
                return {
                  temperature: item.temperature.temperature,
                  timestamp: item.timestamp,
                  email: item.email
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
