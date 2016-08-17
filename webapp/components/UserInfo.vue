<template>
    <div v-if="user != null">
        <div class="card is-fullwidth">
            <div class="card-header">
                <p class="card-header-title">
                    Info
                </p>
            </div>
            <div class="card-content">
                <label class="label">
                    Name
                </label>
                <p>
                    {{ user ? user.name : '' }}
                </p>
                <label class="label">
                    E-mail
                </label>
                <p>
                    {{ user ? user.email : '' }}
                </p>
                <label class="label">
                    Current roles
                </label>

                <span class="tag is-large" v-for="role in user.userroles">
                    <span>{{ role.roleId }}</span>
                </span>
                <label class="label">
                    API Keys
                </label>
                <p class="control is-grouped">
                    <label style="margin-right: 10px;">
                        Password
                    </label>
                    <input class="input control" style="max-width: 50%" type="password" v-model="password">
                    <button class="button control" @click="onCreateToken">Create API token</button>
                </p>
                <p class="control" v-for="token in user.apitokens">
                    <button class="button" @click="onTokenSelect" v-bind:jwt="token.jwt">{{ token.jwt.slice(0,10) }}</button>
                    <button class="button fa fa-trash-o" v-on:click="onDeleteToken" v-bind:jwt="token.jwt"></button>
                </p>

                <textarea class="textarea" v-if="selectedToken != null">
                    {{ selectedToken}}
                </textarea>

            </div>
        </div>

    </div>
    <div class="card is-fullwidth">
        <div class="card-header">
            <p class="card-header-title">
                Consumptions
            </p>
        </div>
        <div class="card-content">
            <table class="table">
                <thead>
                <tr>
                    <th>Consumable</th>
                    <th>Amount</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody v-if="user != null">

                <tr v-for="consumption in user.consumptions | sortDate">
                    <td>{{ consumption.consumable.id}}</td>
                    <td>{{ consumption.amount }}</td>
                    <td>{{ new Date(consumption.createdAt).toString()}}</td>

                </tr>
                </tbody>
            </table>
        </div>

    </div>

</template>
<script>
    import {getCurrentUser} from '../getters'
    import {fetchCurrentUser, deleteAPIToken, createAPIToken} from '../actions'

    export default {
        vuex: {
            getters: {
                user: getCurrentUser
            },
            actions: {
                fetchCurrentUser,
                deleteAPIToken,
                createAPIToken
            }
        },
        data() {
            return {
                selectedToken : null,
                password: ''
            }
        },
        methods: {
            onDeleteToken: function(event, jwt) {
                let fetchCurrentUser = this.fetchCurrentUser;
                this.deleteAPIToken(event.target.getAttribute('jwt')).then(function(success){
                    if(success) {
                        fetchCurrentUser();
                    } else {
                        //error something
                    }
                });
            },
            onTokenSelect: function(event) {
                this.selectedToken = event.target.getAttribute('jwt');
            },
            onCreateToken: function() {
                let fetchCurrentUser = this.fetchCurrentUser;
                this.createAPIToken(this.user.email, this.password).then(function(success) {
                    if(success) {
                        fetchCurrentUser();
                    } else {
                        //error here
                    }
                });
                this.password = '';
            }
        }
    }

</script>