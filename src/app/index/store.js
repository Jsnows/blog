import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import config from '../../../base.config.js'
let url = config.url

Vue.use(Vuex)
let actions = {
    GET_LIST_DATA:function({commit,state}){
        return new Promise((resolve, reject) => {
            axios.get(`${url}home?page=${state.page}`).then((data)=>{
                commit('PAGE_CHANGE')
                commit('SET_DATA',data.data)
                resolve()
            })
        })
    },
    GET_ARTICLE:function({commit},name){
        return new Promise((resolve, reject) => {
            axios.get(`${url}text?file_name=${encodeURI(name)}`).then((data)=>{
                commit('SET_TEXT',data.data)
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    }
}

// commit执行mutations里面的方法
let mutations = {
    SET_DATA:(state,{data}) => {
        state.data = data
    },
    SET_TEXT:(state,{data}) => {
        state.text = data
    }
}
let state = {
    data:{},
    text:'',
    page:1
}
export function createStore() {
    return new Vuex.Store({
        state,
        actions,
        mutations
    })
}


