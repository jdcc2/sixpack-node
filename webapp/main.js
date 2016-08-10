import Vue from 'vue'
import App from './components/App.vue'
import Bulma from 'bulma/css/bulma.css'
import VueRouter from 'vue-router'
import Vuex from 'vuex'


Vue.use(VueRouter);


let router = new VueRouter();

// router.map({
//    '/login' : {
//        component: Login
//    },
//    '/users' : {
//        component: UserManager
//    }
// });

//First argument is a Vue component constructor, second part a css selector to mount in
router.start(App, 'app');
