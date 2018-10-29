/**
 *  引入框架
 */
import Vue from 'vue'
import { createStore } from './store'
// import { sync } from 'vuex-router-sync'
/**
 *  引入根组件
 */
import App from './App.vue'
import { createRouter } from './router'
import iView from 'iview'

/**
 *  start
 */
Vue.use(iView)

export function createApp () {
    const store = createStore()
    const router = createRouter()

    // sync(store, router)

    const app = new Vue({
        router,
        store,
        render: h => h(App)
    })

    return { app, router, store }
}

