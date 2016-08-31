import Vuex from 'vuex'
import Vue from 'vue'
import createLogger from 'vuex/logger'

Vue.use(Vuex);


const state = {
    currentUser: null,
    authenticated : true,
    admin: false,
    beeradmin: false,
    config: {
        //WARNING: the URL determination works because the webapp is loaded on the root URL of the API server, server side configuration (via javascript global) might be better in certain cases
        api_url : window.location.pathname === '/' ? `${window.location.pathname}api` : `${window.location.pathname}/api`,
        url: window.location.pathname
        //api_url : 'http://' + window.location.port === "" ?  window.location.hostname : 'http://' + window.location.hostname + ':' + window.location.port
    },
    users: {},
    consumptions: {},
    consumables: {}
};

const mutations = {
    CURRENTUSER (state, user) {
        state.currentUser = user;
    },
    ADMIN (state, value) {
        state.admin = value;
    },
    BEERADMIN (state, value) {
        state.beeradmin = value;
    },
    USERS (state, users) {
        state.users = users;
    },
    CONSUMPTIONS (state, consumptions) {
        state.consumptions = consumptions;
    },
    CONSUMABLES (state, consumables) {
        state.consumables = consumables;
    }
};

export default new Vuex.Store({
    state,
    mutations,
    middlewares: [createLogger()]
});