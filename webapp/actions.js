"use strict";
import axios from 'axios'

export const showMessage = function({dispatch, state}) {

};

//TODO Make all update functions return a promise so a fetch can be chained
export const fetchUsers = function({dispatch, state}) {
    console.log('fetchusers')
    axios({
        method: 'get',
        url: `${state.config.api_url}/users`,
        headers: {
            "Content-Type": "application/json" //Prevent preflighting for CORS requests
        },
        responseType: 'json'

    }).then((response) => {
        console.log("fetch returned")
        console.log(response);
        if(response.data.ok === true) {
            console.log('fetched users')
            dispatch('USERS', response.data.data);
        } else {
            console.log("get users failed");
        }
        //First element in the items array contains the video data
        //dispatch(videoFetchComplete(response.data.items[0]))

    }).catch((response) => {
        if (response instanceof Error) {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', response.message);
        } else {
            // The request was made, but the server responded with a status code
            // that falls out of the range of 2xx
            console.log("failed fetch");
            console.log(response.data);
            console.log(response.status);
            console.log(response.headers);
            console.log(response.config);
        }
    });

};

//No related objects can be updated directly using this function
//Return the promise so user can wait on success
export const editUser = function({dispatch, state}, user) {
    console.log('user edit')
    return axios({
        method: 'post',
        url: `${state.config.api_url}/users/${user.id}`,
        headers: {
            "Content-Type": "application/json" //Prevent preflighting for CORS requests
        },
        data : JSON.stringify(user),
        responseType: 'json'

    }).then((response) => {
        console.log("user edit returned")
        console.log(response);
        if(response.data.ok === true) {
            console.log('edited user')
            return true;
        } else {
            console.log("could not edit user");
            return false;
        }
        //First element in the items array contains the video data
        //dispatch(videoFetchComplete(response.data.items[0]))

    }).catch(function(response) {
        if (response instanceof Error) {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', response.message);

        } else {
            // The request was made, but the server responded with a status code
            // that falls out of the range of 2xx
            console.log("failed edit");
            console.log(response.data);
            console.log(response.status);
            console.log(response.headers);
            console.log(response.config);
        }
        return false;
    });;
};

export const deleteUser = function({dispatch, state}, user) {
    console.log('user delete')
    return axios({
        method: 'delete',
        url: `${state.config.api_url}/users/${user.id}`,
        headers: {
            "Content-Type": "application/json" //Prevent preflighting for CORS requests
        },
        responseType: 'json'

    }).then((response) => {
        console.log("user delete returned")
        console.log(response);
        if(response.data.ok === true) {
            console.log('deleted user')
            return true;
        } else {
            console.log("could not delete user");
            return false;
        }
        //First element in the items array contains the video data
        //dispatch(videoFetchComplete(response.data.items[0]))

    }).catch(function(response) {
        if (response instanceof Error) {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', response.message);

        } else {
            // The request was made, but the server responded with a status code
            // that falls out of the range of 2xx
            console.log("failed edit");
            console.log(response.data);
            console.log(response.status);
            console.log(response.headers);
            console.log(response.config);
        }
        return false;
    });;
};

export const createUser = function({dispatch, state}, user) {
    console.log('user create')
    return axios({
        method: 'post',
        url: `${state.config.api_url}/users`,
        headers: {
            "Content-Type": "application/json" //Prevent preflighting for CORS requests
        },
        data : JSON.stringify(user),
        responseType: 'json'

    }).then((response) => {
        console.log("create user returned")
        console.log(response);
        if(response.data.ok === true) {
            console.log('created user')
            return true;
        } else {
            console.log("could not create user");
            return false;
        }
        //First element in the items array contains the video data
        //dispatch(videoFetchComplete(response.data.items[0]))

    }).catch(function(response) {
        if (response instanceof Error) {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', response.message);

        } else {
            // The request was made, but the server responded with a status code
            // that falls out of the range of 2xx
            console.log("failed create");
            console.log(response.data);
            console.log(response.status);
            console.log(response.headers);
            console.log(response.config);
        }
        return false;
    });;
};