import Vue from 'vue';
import VueRouter from 'vue-router'
import TemperatureSubmit from "@/components/TemperatureSubmit";
import TemperatureSubmissions from "@/components/TemperatureSubmissions";
import AdminPanel from "@/components/AdminPanel";

Vue.use(VueRouter)

const routes = [
  {path: '/', component: TemperatureSubmit},
  {path: '/submissions', component: TemperatureSubmissions},
  {path: '/admin', component: AdminPanel},
]


export default new VueRouter({
  routes
})
