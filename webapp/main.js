import Vue from 'vue'
import Bulma from 'bulma/css/bulma.css'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import App from './components/App.vue'
import UserManager from './components/admin/UserManager.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'

Vue.use(VueRouter);


let router = new VueRouter();

router.map({
   '/admin' : {
       component: AdminDashboard
   }
});

//First argument is a Vue component constructor, second part a css selector to mount in
router.start(App, 'app');
