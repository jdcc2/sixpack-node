<template>
    <div class="columns">
        <div class="column is-one-quarter">
            <aside class="menu">
                <p class="menu-label">
                    Admin Dashboard
                </p>
                <ul class="menu-list is-three-quarters">
                    <li>
                        <a v-link="{path: '/admin/users'}">
                            Users
                        </a>
                    </li>
                </ul>
            </aside>
        </div>
        <div class="column">
            <router-view></router-view>
        </div>
    </div>
</template>

