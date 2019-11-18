import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import Home from '../views/Home.vue'

Vue.use(VueRouter)
Vue.use(BootstrapVue)
Vue.use(VueResource)

Vue.http.options.root = 'http://127.0.0.1:8888/v1/record'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
