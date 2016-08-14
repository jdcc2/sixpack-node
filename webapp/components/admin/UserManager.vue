<template>

    <div class="modal is-active" v-if="editorVisible">
        <div class="modal-background"></div>
        <div class="modal-container">
            <div class="modal-content">
                <user-editor v-bind:user="users[selectedUser]"></user-editor>
            </div>
        </div>
        <button v-on:click="hideEditor" class="modal-close"></button>
    </div>

    <div class="modal is-active" v-if="creatorVisible">
        <div class="modal-background"></div>
        <div class="modal-container">
            <div class="modal-content">
                <user-creator></user-creator>
            </div>
        </div>
        <button v-on:click="hideCreator" class="modal-close"></button>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Name</th>
                <th>E-mail</th>
                <th>Human?</th>
                <th>Roles</th>
                <th><button v-on:click="onCreate" class="button control">Add user</button></th>
                <th><button v-on:click="fetchUsers" class="button control"><i class="fa fa-refresh" aria-hidden="true"></i></button></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in users" track-by="id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.human }}</td>
                <td>{{ user.userroles | roles }}</td>
                <td>
                    <button v-on:click="onEdit" class="button is-primary control" v-bind:index="$index">Edit</button>
                    <button v-on:click="onDelete" class="button is-primary control" v-bind:index="$index">Delete</button>
                </td>
            </tr>
        </tbody>
    </table>



</template>

<script>
    import {fetchUsers, deleteUser} from '../../actions.js'
    import {getUsers} from '../../getters.js'
    import UserEditor from './UserEditor.vue'
    import UserCreator from './UserCreator.vue'
    import _ from 'underscore'

    export default {
        data() {
            console.log(_.pluck([{"name": "peter"}], 'name'));
            return {
                selectedUser: 0,
                editorVisible: false,
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
        components: {
            UserEditor,
            UserCreator
        },
        methods: {
            onEdit: function(event) {
                this.selectedUser = +event.target.getAttribute('index');
                this.editorVisible = true;

            },
            onCreate: function(event) {
                this.creatorVisible = true;

            },
            hideEditor: function() {
                this.editorVisible = false;
            },
            hideCreator: function() {
                this.creatorVisible = false;
            },
            onDelete: function(event) {
                let fetchUsers = this.fetchUsers;
                this.deleteUser(this.users[+event.target.getAttribute('index')]).then(function(success){
                    if(success) {
                        fetchUsers();
                    }

                })
            }
        },
        events: {
            'editorClose' : function() {
                this.hideEditor();
                this.fetchUsers();


            },
            'creatorClose': function() {
                this.hideCreator();
                this.fetchUsers();
            }
        }
    }
</script>