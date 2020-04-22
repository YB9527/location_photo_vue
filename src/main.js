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
    //host: "http://120.79.177.94:3333/",
    host: "http://127.0.0.1:3334/",
    user: null,
    height: 1260,
    self: '',
    //是否登录后台
    isloginadmin: true,
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    isLoginAdmin(state) {
      return state.isloginadmin;
    },
  },
  mutations: {
    setSelf(state, self) {
      state.self = self;
    },
    setHeight(state, height) {
      state.height = height;
    },
    setUser(state, user) {
      state.user = user;
    },
    postCustom(state, custom) {
      let url = state.host + custom.url;
      let po = custom.po;
      let callback = custom.callback;
      let myFormDatas = new FormData();
      myFormDatas.append('po', JSON.stringify(po));
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
        type: messagecustom.type,
        duration: 2000,
      });
    },
    notify(state, custom) {
      ElementUI.Notification({
        title: custom.title,
        message: custom.message,
        type: custom.type,
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
