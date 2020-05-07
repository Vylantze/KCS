<template>
  <div class="app">
    <Room>
      <Ship />
    </Room>
  </div>
</template>

<script>
import Room from "./components/Room.vue";
import Ship from "./components/Ship.vue";

export default {
  name: "App",
  components: {
    Room,
    Ship
  }
};
</script>

<style lang="less" scoped>
.app {
  position: relative;
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
