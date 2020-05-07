<template>
    <v-app>
        <v-app-bar
                app
                color="primary"
                dark>
            <v-toolbar-title>
                Temperature
            </v-toolbar-title>
        </v-app-bar>

        <v-content>
            <v-container fluid>
                <div v-if="isSignedIn">
                    <v-row>
                        Welcome, {{ user.name }}
                    </v-row>
                </div>
                <template v-else>
                    <v-row>
                        <div class="mx-4">
                            You're not signed in.
                        </div>
                        <v-btn v-on:click="signIn" class="primary mx-4">
                            Sign in
                        </v-btn>
                    </v-row>

                </template>
            </v-container>
            <TemperatureSubmit v-if="isSignedIn"/>
        </v-content>
    </v-app>
</template>

<script>
  import TemperatureSubmit from "@/components/TemperatureSubmit";

  const clientId = "0528299e-063c-4581-8c32-d075c7570138";

  export default {
    name: 'App',

    components: {
      TemperatureSubmit
    },

    data: () => ({
      isSignedIn: false,
      user: {
        name: "",
        email: ""
      }
    }),

    methods: {
      signIn() {
        location.href = `https://login.microsoftonline.com/d72a7172-d5f8-4889-9a85-d7424751592a/oauth2/authorize?client_id=${clientId}&redirect_uri=${location.origin}&response_type=id_token&nonce=${Math.random() * 1000}`
      },
      handleLogin() {
        console.log(location.hash)
        const hashParams = new Map(location.hash.substring(1).split("&").map(a =>
          a.split("=")
        ))
        let code = hashParams.get("id_token")
        if (code) {
          document.cookie = `token=${code}`
          location.hash = ""
        }
        const cookies = new Map(document.cookie.split(" ").map(a =>
          a.split("=")
        ))
        code = code || cookies.get("token")
        if (!code || !code.includes(".") || code.match(/\./g).length !== 2) return
        const [, claimsString,] = code.split(".")
        const claims = JSON.parse(atob(claimsString))
        console.log(claims)
        this.user = {
          name: claims.name,
          email: claims.unique_name
        }
        this.isSignedIn = true
      }
    },
    mounted() {
      this.handleLogin()
    }
  };
</script>
