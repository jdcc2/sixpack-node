import axios from 'axios'

function handleError

export const get


export const login = function ({ dispatch, state }, email, password) {
    console.log(email)
    console.log(`login(): ${email} ${password}`);
    axios({
        method: 'post',
        url: state.config.api_url + '/login',
        //params:  {email : email, password : password},
        data : JSON.stringify({email : email, password : password}),
        headers: {
            "Content-Type": "application/json" //Prevent preflighting for CORS requests
        },
        responseType: 'json'

    }).then((response) => {
        console.log("auth returned")
        console.log(response);
        if(response.data.success === true) {
            //Store the user information in the local storage
            localStorage.setItem("jwt", response.data.jwt);
            localStorage.setItem("user_id", response.data.user_id);
            console.log(response.data);
            //Check the roles
            let isBeerAdmin = false;
            let isAdmin = false;
            response.data.user.roles.map(function(userrole) {
                if(userrole.role.id === 'sixpack_admin') {
                    isAdmin = true;
                } else if (userrole.role.id === 'sixpack_beer_admin') {
                    isBeerAdmin = true;
                }
            });
            dispatch('LOGIN', isAdmin, response.data.user_id, response.data.user, response.data.jwt);


        } else {
            console.log("login failed");
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
            console.log("failed auth")
            console.log(response.data);
            console.log(response.status);
            console.log(response.headers);
            console.log(response.config);
        }
    });


};