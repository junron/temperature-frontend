<template>
    <v-container fluid>
        <div>
            Is this your temperature? {{ temperature }}
        </div>
        <v-spacer></v-spacer>
        <v-form>
            <v-btn v-on:click="submitTemperature" class="success mr-4">
                Yes
            </v-btn>
            <v-btn v-on:click="newRandomTemp" class="error mr-4">
                No
            </v-btn>
        </v-form>
        <div>
            Status: {{ status }}
        </div>
    </v-container>
</template>

<script>

  const getRandomTemperature = () => 30 + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) / 10
  export default {
    name: 'TemperatureSubmit',
    data() {
      return {
        temperature: getRandomTemperature(),
        status: "Not submitted"
      }
    },
    methods: {
      newRandomTemp() {
        this.temperature = getRandomTemperature()
      },
      submitTemperature() {
        fetch("https://temperature.chatbox2.ml/api/add", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            temperature: this.temperature
          })
        }).then(a => a.text())
          .then(a => {
            try {
              const data = JSON.parse(a)
              console.log(data)
              this.status = "Submitted"
            } catch (e) {
              this.status = "Errored: " + a
            }
          })
      }
    }
  }
</script>
