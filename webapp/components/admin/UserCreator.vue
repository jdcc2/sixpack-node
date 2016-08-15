<template>
    <div class="card is-fullwidth">
        <div class="card-header">
            <p class="card-header-title">
                Create user
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
            <label class="label">
                Password
            </label>
            <input class="input control" type="text" v-model="password">
            <input type="checkbox" class="checkbox control"  v-model="human">Human?
            <input type="checkbox" class="checkbox control"  v-model="admin">Admin?
            <input type="checkbox" class="checkbox control"  v-model="beerAdmin">Beer Admin?
            <p class="control">
                <button class="button" @click="onCreate">Save</button>
            </p>
            <div class="notification is-danger" v-if="error">
                Error creating user
            </div>
        </div>

    </div>
</template>

<script>
    import {getUsers} from '../../getters'
    import {createUser} from '../../actions'

    export default {
        vuex: {
            actions: {
                createUser
            }
        },
        data() {
            return {
                error: false,
                name: '',
                email: '',
                password: '',
                beerAdmin: false,
                admin: false,
                human: false
            }

        },
        methods: {
            onCreate() {
                let notifyClose = this.notifyClose;
                let setError = this.setError;
                this.createUser({
                                    name: this.name, email: this.email, password: this.password, human: this.human,
                                    admin: this.admin, beerAdmin: this.beerAdmin
                }).then(function(success){
                    if(success) {
                        notifyClose();
                    } else {
                        setError();
                    }
                })

            },
            setError() {
                this.error = true;
            },
            notifyClose() {
                this.$dispatch('creatorClose');
            }
        }


    }
</script>