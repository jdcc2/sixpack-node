<template>

    <table class="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>E-mail</th>
                <th>Human?</th>
                <th>Roles</th>
                <th><a v-link="{ path: '/admin/users/create'}"><button class="button is-primary control">Add user</button></a></th>
                <th><button v-on:click="fetchUsers" class="button control"><i class="fa fa-refresh" aria-hidden="true"></i></button></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.human }}</td>
                <td>{{ user.userroles | roles }}</td>
                <td>
                    <button class="button is-primary control" v-bind:key="$key" @click="onEdit">Edit</button>
                    <button v-on:click="onDelete" class="button is-primary control" v-bind:key="$key">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>



</template>

<script>
    import {fetchUsers, deleteUser} from '../../actions.js'
    import {getUsers} from '../../getters.js'
    import _ from 'underscore'

    export default {
        data() {
            return {
                creatorVisible: false
            }
        },
        ready() {
            this.fetchUsers();
        },
        vuex: {
            actions: {
                fetchUsers,
                deleteUser
            },
            getters: {
                users: getUsers
            }
        },
        methods: {
            onDelete: function(event) {
                let fetchUsers = this.fetchUsers;
                this.deleteUser(this.users[+event.target.getAttribute('key')]).then(function(success){
                    if(success) {
                        fetchUsers();
                    }

                })
            },
            onEdit: function(event){
                //The same function could be achieved by using a v-link attribute on the edit button/a tag
                this.$route.router.go({path: `/admin/users/edit/${+event.target.getAttribute('key')}` })
            },
            onCreate: function(event) {
                this.$route.router.go('/admin/users/create');
            }
        }
    }
</script>