<template>
  <div class="app">
    <Room />
  </div>
</template>

<script>
import Room from "./components/Room.vue";

export default {
  name: "App",
  components: {
    Room
  }
};
</script>

<style lang="less" scoped>
.app {
  height: 100%;
  width: 100%;
  display: flex;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  //color: #2c3e50;
  //margin-top: 60px;
}
</style>
