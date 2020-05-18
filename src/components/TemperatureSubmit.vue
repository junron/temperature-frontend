<template>
    <v-container fluid>
        <div class="mb-3" align="center" >
            My temperature:
        </div>
        <div>
            <v-text-field
                    v-model="numberValue"
                    hide-details
                    single-line
                    type="number"
                    filled = true
                    persistent-hint = true
                    placeholder="Enter in Celsius..."

            />
        </div>
        <v-form align="center">
            <v-btn v-on:click="submitTemperature" class="success my-5 elevation-3">
                Submit
            </v-btn>
        </v-form>
        <v-divider></v-divider>
        <div class="my-5" align="center">
            Status: {{ status }}
        </div>
    </v-container>
</template>

<script>

    export default {
      components: {  },
    name: 'TemperatureSubmit',
    data() {
      return {
        status: "Not submitted"
      }
    },
    methods: {
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


