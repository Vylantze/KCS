import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
require('../public/include');

import './style.less';

Vue.config.productionTip = false;
Vue.use(Vuex);

new Vue({
  render: h => h(App),
}).$mount('#app');
