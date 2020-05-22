<template>
    <v-container fluid>
        <v-card>
            <v-card-title>
                Your Temperature Submissions
            </v-card-title>
            <v-btn
                    icon
                    class="ma-2"
                    @click="prev"
            >
                <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            {{ calendarTitle }}
            <v-btn
                    icon
                    class="ma-2"
                    @click="next"
            >
                <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-calendar
                    v-model="calendarValue"
                    ref="calendar"
                    type="month"
                    :events="eventsData"
                    @change="updateRange"
            />
        </v-card>
    </v-container>
</template>

<script>

  export default {
    name: 'TemperatureSubmissions',
    data: function () {
      return {
        fetchError: false,
        fetchedData: null,
        calendarValue: '',
        start: null
      };
    },
    computed: {
      eventsData: function () {
        if (this.fetchedData == null) return []
        return this.fetchedData.map(a => {
          return {
            name: a.temperature.toString(),
            start: this.formatDate(new Date(a.timestamp))
          }
        })
      },
      calendarTitle: function () {
        const dtf = new Intl.DateTimeFormat('en', {
          month: 'short',
          year: 'numeric'
        })
        if (this.start)
          return dtf.format(new Date(this.start.date))
        else return ""
      }
    },
    created() {
      this.fetchData()
    },
    methods: {
      async fetchData() {
        return fetch(`https://temperature.chatbox2.ml/api/temperatures`, {
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
      isLate(timestamp) {
        const dtf = new Intl.DateTimeFormat('en', {
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        })
        // eslint-disable-next-line no-unused-vars
        const [, , , , {value: hour}, , , , ,] = dtf.formatToParts(timestamp)
        return !(hour < 9 && hour >= 6);
      },
      formatDate(date) {
        const dtf = new Intl.DateTimeFormat('en', {
          month: 'numeric',
          day: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        })
        const [{value: mo}, , {value: da}, , {value: year}, , {value: hour}, , {value: minute}] = dtf.formatToParts(date)
        return `${year}-${mo}-${da} ${hour}:${minute}`
      },
      prev() {
        this.$refs.calendar.prev()
      },
      next() {
        this.$refs.calendar.next()
      },
      updateRange({start}) {
        this.start = start
      }
    }
  }
</script>
