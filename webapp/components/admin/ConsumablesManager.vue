<template>
    <div class="control is-grouped is-pulled-left is-danger">
        <label class="control-label">
            Name
        </label>
        <input class="input control" type="text" v-model="name">
        <label class="control-label">
            Description
        </label>
        <input class="input control" type="text" v-model="description">
        <p>
            <button class="button" @click="onCreate">Create</button>
        </p>
    </div>
    <span class="tag is-danger" v-if="error">
        Error creating consumable
    </span>
    <table class="table">
        <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th><button v-on:click="fetchConsumables" class="button control"><i class="fa fa-refresh" aria-hidden="true"></i></button></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="consumable in consumables">
            <td>{{ consumable.id }}</td>
            <td>{{ consumable.name }}</td>
            <td>{{ consumable.description }}</td>
            <td>
                <button v-on:click="onDelete" class="button is-primary control" v-bind:key="$key">Delete</button>
            </td>
        </tr>
        </tbody>
    </table>



</template>

<script>
    import {fetchConsumables, createConsumable} from '../../actions.js'
    import {getConsumables} from '../../getters.js'
    import _ from 'underscore'

    export default {
        ready() {
            this.fetchConsumables();
        },
        data() {
            return {
                name: '',
                description: '',
                error: false
            }
        },
        vuex: {
            actions: {
                fetchConsumables,
                createConsumable

            },
            getters: {
                consumables: getConsumables
            }
        },
        methods: {
            onCreate: function(event) {
                console.log(this.name);
                console.log(this.description)
                let setError = this.setError;
                let fetchConsumables = this.fetchConsumables;
                this.createConsumable(this.name, this.description).then(function(success){
                    if(success) {
                        setError(false);
                        fetchConsumables();
                    } else {
                        setError(true);
                    }
                })
            },
            setError(value) {
                this.error = value;
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