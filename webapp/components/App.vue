<template>
    <div class="container">
        <section class="hero">
            <div class="container is-fluid">
                <div class="hero-body">
                    <h1 class="title">
                        Sixpack
                    </h1>
                    <h2 class="subtitle">
                        Consumptie manager
                    </h2>
                </div>
            </div>
        </section>
        <div class="nav">
            <div class="nav-right nav-menu">
                <a class="nav-item is-tab" v-link="{path: '/', exact: true}">Home</a>
                <a class="nav-item is-tab" v-link="{path: '/admin'}">Admin</a>
                <a class="nav-item" href="/auth/logout">Logout</a>
                <span></span>
            </div>
        </div>
        <div class="section">
            <router-view></router-view>
        </div>




    </div>
</template>

<script>
    import store from '../store'

    export default {
        store
    }
</script>