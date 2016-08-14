import Vue from 'vue'
import Bulma from 'bulma/css/bulma.css'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import _ from 'underscore'
import App from './components/App.vue'
import UserManager from './components/admin/UserManager.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'

Vue.use(VueRouter);
Vue.use(Vuex);

//Filters
Vue.filter('roles', function (userroles) {
    return _.pluck(userroles, 'roleId')
});

let router = new VueRouter({linkActiveClass: 'is-active'});

router.map({
   '/admin' : {
       component: AdminDashboard,
       subRoutes: {
           '/': {
               component: {
                   template: '<h1>Admin Dashboard. Use the menu o nthe right.</h1>'
               }
           },
           '/users': {
               component: UserManager
           }

       }
   }
});

//First argument is a Vue component constructor, second part a css selector to mount in
router.start(App, 'app');
