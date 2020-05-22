<template>
    <v-app>
        <v-navigation-drawer
                v-model="drawerShown"
                temporary app>
            <v-list-item>
                <v-list-item-content>
                    <v-icon size="100">mdi-account</v-icon>
                    <v-list-item-title>
                        Welcome, {{ user.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        {{ user.email.startsWith("h1") ? "Student" : "Teacher" }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>
            <v-list
                    dense
                    nav>
                <router-link v-for="item in routes"
                             :to="item.route"
                             @click="drawerShown = false"
                             style="text-decoration: none; color: inherit;"
                             :key="item.name">
                    <v-list-item link>
                        <v-list-item-icon>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ item.name }}
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider/>
                </router-link>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar
                app
                color="primary"
                dark>
            <v-app-bar-nav-icon @click="drawerShown = !drawerShown"/>
            <v-toolbar-title>
                Temperature
            </v-toolbar-title>
        </v-app-bar>

        <v-content>
            <v-container fluid>
                <template v-if="!isSignedIn">
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
            <router-view v-if="isSignedIn"/>
        </v-content>
    </v-app>
</template>

<script>

  const clientId = "0528299e-063c-4581-8c32-d075c7570138";

  export default {
    name: 'App',

    components: {},

    data: () => ({
      isSignedIn: false,
      user: {
        name: "",
        email: ""
      },
      routes: [
        {
          name: "Submit temperature",
          route: "/",
          icon: "mdi-thermometer"
        },
        {
          name: "Submissions",
          route: "/submissions",
          icon: "mdi-history"
        }
      ],
      drawerShown: false
    }),

    methods: {
      signIn() {
        location.href = `https://login.microsoftonline.com/d72a7172-d5f8-4889-9a85-d7424751592a/oauth2/authorize?client_id=${clientId}&redirect_uri=${location.origin}&response_type=id_token&nonce=${Math.random() * 1000}`
      },
      handleLogin() {
        console.log(location.hash)
        const hashParams = new Map(location.hash.substring(1).split("&").map(a =>
          a.split("=").map(a => a.replace("/", ""))
        ))
        let code = hashParams.get("id_token")
        if (code) {
          const expiry = new Date()
          expiry.setTime(expiry.getTime() + 30 * 24 * 60 * 60 * 1000)
          document.cookie = `token=${code};expires=${expiry.toUTCString()}`
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
      console.log("mounted")
      this.handleLogin()
    }
  };
</script>
