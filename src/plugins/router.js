import Vue from 'vue';
import VueRouter from 'vue-router'
import TemperatureSubmit from "@/components/TemperatureSubmit";
import TemperatureSubmissions from "@/components/TemperatureSubmissions";

Vue.use(VueRouter)

const routes = [
  {path: '/', component: TemperatureSubmit},
  {path: '/submissions', component: TemperatureSubmissions}
]


export default new VueRouter({
  routes
})
