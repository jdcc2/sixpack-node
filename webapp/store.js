import Vuex from 'vuex'
import Vue from 'vue'
import createLogger from 'vuex/logger'

Vue.use(Vuex);


const state = {
    currentUser: null,
    authenticated : false,
    config: {
        api_url : 'http://localhost:8081'
        //api_url : 'http://' + window.location.port === "" ?  window.location.hostname : 'http://' + window.location.hostname + ':' + window.location.port
    }
};

const mutations = {
    LOGIN (state, admin, user_id, user, jwt) {
        state.currentUser.authenticated = true;
        state.currentUser.admin = admin;
        state.currentUser.user_id = user_id;
        state.currentUser.user = user;
        state.currentUser.jwt = jwt;
    }
};

export default new Vuex.Store({
    state,
    mutations,
    middlewares: [createLogger()]
});