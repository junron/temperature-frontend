<template>
    <v-container fluid>
        <div class="mb-3" align="center" style="font-size: 30px">
            Submit temperature
        </div>
        <div>
            <v-text-field
                    v-model="temperature"
                    single-line
                    type="number"
                    filled = true
                    hint="Enter in ºC"
                    persistent-hint = true
                    placeholder="Enter in ºC..."
            />
        </div>
        <v-form align="center">
            <v-btn class="success my-5 elevation-3" @click = "dialog = true">
                Submit
            </v-btn>
        </v-form>
        <v-divider></v-divider>
        <div class="my-5" align="center">
            Status: {{ status }}
        </div>
        <v-dialog v-model = "dialog" max-width="300">
            <v-card>
                <v-card-title>Confirm Submission</v-card-title>
                <v-card-text>You cannot undo this action. Continue?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" text @click="dialog = false">Close</v-btn>
                    <v-btn color="blue" text @click="dialog = false" v-on:click="submitTemperature">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>

    export default {
      components: {  },
    name: 'TemperatureSubmit',
    data() {
      return {
          temperature: 36.9,
        status: "Not submitted",
          dialog: false
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



