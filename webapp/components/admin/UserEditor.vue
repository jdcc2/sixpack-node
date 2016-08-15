<template>
    <div class="card is-fullwidth">
        <div class="card-header">
             <p class="card-header-title">
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
            </p>
            <div class="notification is-danger" v-if="error">
                {{ errorMessage }}
            </div>
        </div>

    </div>
</template>

<script>
    import {editUser, fetchUsers, deleteUserRole, createUserRole} from '../../actions'
    import _ from 'underscore'

    export default {
        vuex: {
            actions: {
                editUser,
                fetchUsers,
                deleteUserRole,
                createUserRole
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
                selectedRole: 'sixpackadmin'
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
                this.editUser({id: this.id, name: this.name, email: this.email, human: this.human}).then(function(success){
                    if(success) {
                        notifyClose();
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
            notifyClose() {
                this.$dispatch('editorClose');
            }
        },
        props : ['user']


    }
</script>