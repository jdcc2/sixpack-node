<template>
    <h1>User manager</h1>
    <div>{{ users | json }}</div>

    <button v-on:click="doFetch" class="button is-primary control">Fetch users</button>
</template>

<script>
    import {fetchUsers} from '../../actions.js'
    import {getUsers} from '../../getters.js'

    export default {
        vuex: {
            actions: {
                fetchUsers : fetchUsers
            },
            getters: {
                users: getUsers
            }
        },
        methods: {
            doFetch: function() {
                console.log('doFetch')
                this.fetchUsers();
            }
        }
    }
</script>