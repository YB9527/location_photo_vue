// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';

Vue.use(ElementUI);

import axios from 'axios'

Vue.config.productionTip = false

import Vuex from 'vuex'

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    //host: "http://prsmartoa.com:3334/",
    //host: "http://127.0.0.1:3333/springboot/",
    host: "http://127.0.0.1:3333/",
    //host:"http://prsmartoa.com:10529/springboot/",
    user: null,
    height: 1260,
    width:500,
    self: '',
    //是否登录后台
    isloginadmin: true,
  },
  getters: {
    getHost(state){
      return state.host;
    },
    getMapHost(state){
      return state.host+"map/";
    },

    getUser(state) {
      return state.user;
    },
    isLoginAdmin(state) {
      return state.isloginadmin;
    },
    getWindowHeight(state) {
      return state.height;
    },
    getWindowWidth(state) {
      return state.width;
    },
  },
  mutations: {
    setSelf(state, self) {
      state.self = self;
    },
    setHeight(state, height) {
      state.height = height;
    },
    setWidth(state, width) {
      state.width = width;
    },
    setUser(state, user) {
      state.user = user;
    },
    /**
     * post 多个文件
     * @param state
     * @param custom
     */
    postFiles(state,custom){
      let headers = {
        'Content-Type': 'multipart/form-data'
      };
      axios.post(custom.url, custom.formData, {headers: headers})
        .then(res=>{
          custom.callback(res.data);
        });
    },
    postCustom(state, custom) {
      let url = state.host + custom.url;
      let po = custom.po;
      let callback = custom.callback;
      let myFormDatas = new FormData();
      let mark = 'po';
      if(custom.mark){
        mark = custom.mark;
      }
      myFormDatas.append(mark, JSON.stringify(po));
      axios({
        url: url,
        method: "POST",
        data: myFormDatas,
      })
        .then(res => {
          callback(res.data);
        })
    },
    postFormDataCustom(state, custom) {
      let url = state.host + custom.url;
      let callback = custom.callback;
      let myFormDatas = custom.formdata;
      axios({
        url: url,
        method: "POST",
        data: myFormDatas,
      })
        .then(res => {
          callback(res.data);
        })
    },


    getCustom(state, custom) {
      let url = state.host + custom.url;
      let callback = custom.callback;
      axios.get(url)
        .then(res => {
          callback(res.data);
        });
    },
    confirm(state, callbackpo) {
      state.self.$confirm(callbackpo.message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        callbackpo.callback(true);
      }).catch(() => {
        callbackpo.callback(false);
      });
    },
    showMessageBox(state, messagecustom) {
      ElementUI.Message({
        showClose: true,
        message: messagecustom.message,
        type: messagecustom.type.toLowerCase(),
        duration: 2000,
      });
    },
    notify(state, custom) {
      ElementUI.Notification({
        title: custom.title,
        message: custom.message,
        type: custom.type.toLowerCase(),
        duration: 2000,
      });
    },
  }
});

Vue.filter('dateFormat', (value) => {
  if (!value) {
    return value;
  }
  let date = new Date(value);
  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
});


export default store

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>'
})
