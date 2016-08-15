<template>

    <table class="table">
        <thead>
        <tr>
            <th>Username</th>
            <th>User ID</th>
            <th>Consumable</th>
            <th>Amount</th>
            <th><button v-on:click="onCreate" class="button control">Add consumption</button></th>
            <th><button v-on:click="fetchConsumptions" class="button control"><i class="fa fa-refresh" aria-hidden="true"></i></button></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="consumption in consumptions" track-by="id">
            <td></td>
            <td>{{ consumption.userId }}</td>
            <td>{{ consumption.consumableId }}</td>
            <td></td>
            <td>
                <button v-on:click="onDelete" class="button is-primary control" v-bind:index="$index">Delete</button>
            </td>
        </tr>
        </tbody>
    </table>



</template>

<script>
    import {fetchConsumptions, fetchUsers, fetchConsumables, deleteUser} from '../../actions.js'
    import {getConsumptions, getConsumables, getUsers} from '../../getters.js'
    import _ from 'underscore'

    export default {
        ready() {
            this.fetchUsers();
            this.fetchConsumables();
            this.fetchConsumptions();
        },
        vuex: {
            actions: {
                fetchConsumptions,
                fetchConsumables,
                fetchUsers
            },
            getters: {
                consumptions: getConsumptions
            }
        },
        methods: {
            onCreate: function(event) {


            },
            onDelete: function(event) {
                let fetchUsers = this.fetchUsers;
                this.deleteUser(this.users[+event.target.getAttribute('index')]).then(function(success){
                    if(success) {
                        fetchUsers();
                    }

                })
            }
        }
    }
</script>