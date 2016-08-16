<template>
    <div class="columns">
        <div class="column is-one-quarter">
            <aside class="menu">
                <p class="menu-label">
                    Admin Dashboard
                </p>
                <ul class="menu-list">
                    <li>
                        <a v-link="{path: '/admin/users'}">
                            Users
                        </a>
                    </li>
                    <li>
                        <a v-link="{path: '/admin/consumptions'}">
                            Consumptions
                        </a>
                    </li>
                    <li>
                        <a v-link="{path: '/admin/consumables'}">
                            Consumables
                        </a>
                    </li>
                </ul>
            </aside>
        </div>
        <div class="column is-three-quarters">
            <router-view></router-view>
        </div>
    </div>
</template>
<script>
    export default {
        vuex: {
            getters: {
                admin: function(state) {return state.admin;}
            }
        },
        //Prevent users from accessing the admin panel by URL if they do not have the admin role (and cannot use the admin panel)
        route: {
            activate: function(transition) {
                console.log('admin activated');
                if(this.admin === true) {
                    transition.next()
                } else {
                    transition.abort()
                    console.log('admin ui aborted')
                }
            }
        }
    }
</script>

