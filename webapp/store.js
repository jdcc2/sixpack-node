import Vuex from 'vuex'
import Vue from 'vue'
import createLogger from 'vuex/logger'

Vue.use(Vuex);


const state = {
    currentUser: null,
    authenticated : true,
    config: {
        api_url : 'http://localhost:3000/api'
        //api_url : 'http://' + window.location.port === "" ?  window.location.hostname : 'http://' + window.location.hostname + ':' + window.location.port
    },
    users: [],
    consumptions: [],
    consumables: []
};

const mutations = {
    LOGIN (state, admin, user_id, user, jwt) {
        state.currentUser.authenticated = true;
        state.currentUser.admin = admin;
        state.currentUser.user_id = user_id;
        state.currentUser.user = user;
        state.currentUser.jwt = jwt;
    },
    CURRENTUSER (state, user) {
        state.currentUser = user;
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