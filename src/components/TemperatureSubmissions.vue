<template>
    <v-container fluid>
        <v-card>
            <v-card-title>
                Your Temperature Submissions
                <v-spacer/>
            </v-card-title>
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
                    <v-chip v-if="isLate(new Date(item.timestamp))" style="margin-left:5px" :color="darkgrey" dark>
                        LATE!
                    </v-chip>
                </template>
                <template v-slot:item.timestamp="{ item }">
                    {{ formatDate(new Date(item.timestamp)) }}
                </template>
            </v-data-table>
            <v-calendar
                    ref="calendar"
                    v-model="focus"
                    type="month"
                    :events="eventsData">

            </v-calendar>
        </v-card>
    </v-container>
</template>

<script>

    export default {
        name: 'TemperatureSubmissions',
        data: function () {
            return {
                headers: [
                    {text: "Timestamp", value: "timestamp", divider: true, width: '10%'},
                    {text: "Temperature", value: "temperature"},
                ],
                fetchError: false,
                fetchedData: null,
                todayOnly: false,
                search: "",
                events: []
            };
        },
        computed: {
            filteredData: function () {
                let filtered = this.fetchedData
                console.log(this.fetchedData)
                if (filtered == null) return null
                console.log(filtered)
                return filtered
            },
            eventsData: function () {
                console.log(this.events)

                return this.events
            }
        },
        created() {
            this.fetchData("")
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
                            this.events = JSON.parse(text).map(item => {
                                return {
                                    name: item.temperature.temperature,
                                    start: new Date(item.timestamp)
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
                    hour12: true,
                })
                // eslint-disable-next-line no-unused-vars
                const [{value: mo}, , {value: da}, , {value: hour}, , {value: minute}, , , , {value: dayPeriod}] = dtf.formatToParts(timestamp)
                if (dayPeriod == 'AM' && hour < 9 && hour >= 6)
                    return false
                return true
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
