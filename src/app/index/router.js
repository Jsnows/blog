import Vue from 'vue'
import Router from 'vue-router'

/**
 *  需要引入的路由模板
 *  example : import Hello from 'router/hello/App.vue'
 */
Vue.use(Router)

// const Page = () => import('components/page/page.vue')
// const Article = () => import('components/article/article.vue')
// const aboutMe = () => import('components/about-me/about-me.vue')

import Page from 'components/page/page.vue'
import Article from 'components/article/article.vue'
import aboutMe from 'components/about-me/about-me.vue'

const routes = [
    {
        path: '/',
        name:'home',
        component: {
            name:'page',
            asyncData({store,route}){
                return store.dispatch('GET_LIST_DATA')
            },
            render (h) {
                return h(Page)
            }
        }
    },
    {
        path: '/article',
        name:'article',
        component: {
            name:'article',
            asyncData:({store,route})=>{
                return store.dispatch('GET_ARTICLE',route.query.name)
            },
            render (h) {
                return h(Article)
            }
        }
    },{
        path: '/about-me',
        name: 'aboutMe',
        component: {
            name:'page',
            asyncData:({store})=>{
                return store.dispatch('GET_LIST_DATA')
            },
            render (h) {
                return h(aboutMe)
            }
        }
    }
]

export function createRouter() {
    return new Router({
        mode: 'history',
        fallback: false,
        scrollBehavior: () => ({y: 0}),
        routes: routes
    });
}
