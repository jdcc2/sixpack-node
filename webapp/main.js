import Vue from 'vue'
import Bulma from 'bulma/css/bulma.css'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import _ from 'underscore'
import App from './components/App.vue'
import UserManager from './components/admin/UserManager.vue'
import ConsumptionManager from './components/admin/ConsumptionManager.vue'
import ConsumablesManager from './components/admin/ConsumablesManager.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'

Vue.use(VueRouter);
Vue.use(Vuex);

//Filters
Vue.filter('roles', function (userroles) {
    return _.pluck(userroles, 'roleId')
});

Vue.filter('sortDate', function(objectlist) {
   return _.sortBy(_.toArray(objectlist), 'createdAt').reverse()
});

let router = new VueRouter({linkActiveClass: 'is-active'});

router.map({
   '/admin' : {
       component: AdminDashboard,
       subRoutes: {
           '/': {
               component: {
                   template: '<h1>Admin Dashboard. Use the menu on the right.</h1>'
               }
           },
           '/users': {
               component: UserManager
           },
           '/consumptions': {
               component: ConsumptionManager
           },
           '/consumables': {
               component: ConsumablesManager
           }

       }
   }
});

//First argument is a Vue component constructor, second part a css selector to mount in
router.start(App, 'app');
