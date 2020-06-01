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
                    :weekdays="[1,2,3,4,5]"
                    :event-ripple="false"
                    :events="eventsData()"
                    :event-color="getColor"
                    :event-text-color="getTextColor"
                    @change="updateRange"
            />
        </v-card>
    </v-container>
</template>

<script>
  import dateutils from "@/utils/dateutils";

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
            eventsData() {
                if (this.fetchedData == null) return []
                return this.fetchedData.map(a => {
                    return {
                      name: a.temperature.toString(),
                      start: dateutils.formatDate(dateutils.parseDateLocalTime(a.timestamp)),
                    }
                })
            },
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
            getColor(event) {
              console.log(event.start)
                let timestamp = new Date(event.start)
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
                if (!(hour < 9 && hour >= 6))
                    return '#E8E8E8'
                else {
                    let temperature = parseFloat(event.name)
                    if (temperature >= 37.4)
                        return 'red'
                    else if (temperature < 35)
                        return 'blue'
                    else
                        return '#026428'
                }
            },
            getTextColor(event) {
                let timestamp = new Date(event.start)
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
                if (!(hour < 9 && hour >= 6)){
                    let temperature = parseFloat(event.name)
                    if (temperature >= 37.4)
                        return 'red'
                    else if (temperature < 35)
                        return 'blue'
                    else
                        return '#026428'
                }
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
