<template>
    <div class="card is-fullwidth">
        <div class="card-header">

             <p class="card-header-title">
                 <a v-link="{path: '/admin/users'}"><i class="fa fa-arrow-left"></i></a><span style="width: 20px;"></span>
                 Edit user {{ id }}
             </p>
        </div>
        <div class="card-content">
            <label class="label">
                Name
            </label>
            <input class="input control" type="text" v-model="name">
            <label class="label">
                E-mail
            </label>
            <input class="input control" type="text" v-model="email">
            <input type="checkbox" class="checkbox control"  v-model="human">Human?
            <input type="checkbox" class="checkbox control"  v-model="active">Active?
            <label class="label">
                Current roles
            </label>
            <span class="tag is-large" v-for="role in user.userroles">
                <span>{{ role.roleId }}</span>
                <button class="button delete" v-bind:index="$index" @click="doDeleteUserRole"></button>
            </span>
            <label class="label">
                Add role
            </label>
            <p class="control">
                <span class="select">
                    <select v-model="selectedRole">
                        <option>sixpackadmin</option>
                        <option>beeradmin</option>
                    </select>
                </span>
                <button class="button" @click="doAddUserRole">Add role</button>
            </p>

            <p class="control">
                <button class="button" @click="doEdit">Save</button>
                <button class="button" @click="onReturn">Cancel</button>
            </p>
            <div class="notification is-danger" v-if="error">
                {{ errorMessage }}
            </div>
        </div>

    </div>
</template>

<script>
    import {editUser, fetchUsers, deleteUserRole, createUserRole} from '../../actions'
    import {getUsers} from '../../getters'
    import _ from 'underscore'

    export default {
        vuex: {
            actions: {
                editUser,
                fetchUsers,
                deleteUserRole,
                createUserRole
            },
            getters: {
                users: getUsers
            }
        },
        data() {
            return {
                error: false,
                errorMessage: '',
                id: '',
                name: '',
                email: '',
                human: false,
                active: false,
                selectedRole: 'sixpackadmin'
            }

        },
        computed: {
            user: function() {
                return this.users[this.$route.params.userId];
            }
        },
        //Copy user properties initially so an update of the user list does not destroy the edits
        ready() {
            this.loadUser();
        },
        methods: {
            doEdit() {
                let notifyClose = this.notifyClose;
                let setError = this.setError;
                let onReturn = this.onReturn;
                this.editUser({id: this.id, name: this.name, email: this.email, human: this.human, active: this.active}).then(function(success){
                    if(success) {
                        onReturn();
                    } else {
                        setError('Error editing user.');
                    }
                })

            },
            loadUser() {
                this.id = this.user.id;
                this.name = this.user.name;
                this.email = this.user.email;
                this.human = this.user.human;
                this.active = this.user.active;
            },
            doDeleteUserRole(event) {
                let setError = this.setError;
                let fetchUsers = this.fetchUsers;
                this.deleteUserRole(this.user.userroles[+event.target.getAttribute('index')]).then(function(success) {
                   if(success) {
                       fetchUsers();
                   } else {
                       setError('Error deleting userrole');
                   }
                });
            },
            doAddUserRole() {
                let setError = this.setError;
                let fetchUsers = this.fetchUsers;
                //The if statement checks if the user already has the role to be added
                if(_.indexOf(_.pluck(this.user.userroles, 'roleId'), this.selectedRole) === -1) {
                    this.createUserRole(this.id, this.selectedRole).then(function(success) {
                        if(success) {
                            fetchUsers();
                        } else {
                            setError('Error deleting userrole');
                        }
                    });
                }

            },
            setError(errorMessage) {
                this.error = true;
                this.errorMessage = errorMessage;
            },
            onReturn() {
                this.$route.router.go('/admin/users')
            }
        }


    }
</script>