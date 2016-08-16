<template>
    <p class="control is-group">
                <span class="control-label">
                    User
                </span>
                <span class="select">
                    <select v-model="selectedUser">
                        <option v-bind:value="{ id: user.id}" v-for="user in users">{{ user.name }}</option>
                    </select>
                </span>
                <span class="control-label">
                    Consumable
                </span>
                <span class="select">
                    <select v-model="selectedConsumable">
                        <option v-bind:value="{ id: consumable.id}" v-for="consumable in consumables">{{ consumable.name }}</option>
                    </select>
                </span>
                <span class="control-label">
                    Amount
                </span>
                <span class="select">
                    <select v-model="selectedAmount">
                        <option v-bind:value="{ amount: n+1}" v-for="n in 5">{{ n+1 }}</option>
                        <option v-bind:value="{ amount: (n+1) * 10}" v-for="n in 5">{{ (n+1) * 10 }}</option>
                        <option v-bind:value="{ amount: 100}">{{ 100 }}</option>
                    </select>
                </span>
        <button class="button" @click="onCreate">Add Consumption</button>
    </p>
    <span class="tag is-danger" v-if="error">
        Error creating consumption
    </span>
    <table class="table">
        <thead>
        <tr>
            <th>Username</th>
            <th>User ID</th>
            <th>Consumable</th>
            <th>Amount</th>
            <th>Date</th>
            <th><button v-on:click="onRefresh" class="button control"><i class="fa fa-refresh" aria-hidden="true"></i></button></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="consumption in consumptions | sortDate">
            <td>{{ users.hasOwnProperty(consumption.userId) ? users[consumption.userId].name : ''}}</td>
            <td>{{ consumption.userId }}</td>
            <td>{{ consumables.hasOwnProperty(consumption.consumableId) ? consumables[consumption.consumableId].name : '' }}</td>
            <td>{{ consumption.amount }}</td>
            <td>{{ new Date(consumption.createdAt).toString()}}</td>
            <td>
                <button v-on:click="onDelete" class="button is-primary control" v-bind:key="consumption.id">Delete</button>
            </td>
        </tr>
        </tbody>
    </table>



</template>

<script>
    import {fetchConsumptions, fetchUsers, fetchConsumables, deleteConsumption, createConsumption} from '../../actions.js'
    import {getConsumptions, getConsumables, getUsers} from '../../getters.js'
    import _ from 'underscore'

    export default {
        created() {
            this.fetchUsers();
            this.fetchConsumables();
            this.fetchConsumptions();
        },
        data() {
            return {
                selectedUser: null,
                selectedConsumable: null,
                selectedAmount: 0,
                error: false
            }
        },
        vuex: {
            actions: {
                fetchConsumptions,
                fetchConsumables,
                fetchUsers,
                deleteConsumption,
                createConsumption
            },
            getters: {
                consumptions: getConsumptions,
                users: getUsers,
                consumables: getConsumables
            }
        },
        methods: {
            onCreate: function(event) {
                let setError = this.setError;
                let onRefresh = this.onRefresh;
                if(this.selectedUser != null && this.selectedConsumable != null) {
                    this.createConsumption(this.selectedUser.id, this.selectedConsumable.id, this.selectedAmount.amount).then(function(success){
                        if(success) {
                            setError(false);
                            onRefresh();
                        } else {
                            setError(true);
                        }
                    });
                }


            },
            onDelete: function(event) {
                let onRefresh = this.onRefresh;
                this.deleteConsumption(this.consumptions[+event.target.getAttribute('key')]).then(function(success){
                    if(success) {
                        onRefresh();
                    }

                })
            },
            onRefresh: function(event) {
                this.fetchUsers();
                this.fetchConsumables();
                this.fetchConsumptions();
            },
            setError(value) {
                this.error = value;
            }
        }
    }
</script>