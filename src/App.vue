<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  import olmap from './components/test/olmap.vue'
  export default {
    name: 'App',
    components: {
      olmap
    },
    created() {
      this.$store.commit("setSelf", this);
      this.setHeight();
    },

    watch: {
      $route(to, from) {
        this.setHeight();
      },
    },
    methods: {
      setHeight() {
        this.$store.commit("setHeight", window.innerHeight - 10);
        this.$store.commit("setWidth", window.innerWidth - 10);
      },

    }
  }
</script>

<style>

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 2px;
  }
</style>
