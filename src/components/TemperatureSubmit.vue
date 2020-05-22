<template>
    <v-container fluid>
        <v-row class="justify-center">
            <v-card class="mx-4" elevation="10" min-width="70%">
                <v-card-title>Submit temperature</v-card-title>
                <v-form
                        v-model="valid"
                        class="mx-4">
                    <v-text-field
                            :rules="rules"
                            v-model="temperature"
                            type="number"
                            placeholder="Enter temperature"
                            filled
                            suffix="ºC"
                            required
                    />
                    <v-btn :disabled="!valid" class="success my-5 elevation-3" @click="submitTemperature">
                        Submit
                    </v-btn>
                    <v-divider></v-divider>
                    <div class="my-5">
                        Status: {{ status }}
                    </div>
                </v-form>
            </v-card>
        </v-row>
    </v-container>
</template>

<script>

  export default {
    components: {},
    name: 'TemperatureSubmit',
    data() {
      return {
        valid: false,
        temperature: null,
        status: "Not submitted",
        dialog: false,
        rules: [
          value => {
            const val = parseFloat(value)
            return (val > 35 && val < 42) || "Temperature must be between 35 and 42ºC"
          }
        ]
      }
    },
    methods: {
      submitTemperature() {
        this.status = "Submitting..."
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



