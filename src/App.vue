<template>
  <div class="app">
    <Room>
      <Ship v-if="selectedShip" :shipName="selectedShip" :shipSprite="selectedSprite" />
    </Room>
    <div class="ui-container center-div">
      <UILayer
        :selectedShip="selectedShip"
        :selectedSprite="selectedSprite"
        @update:selectedShip="selectedShip = $event"
        @update:selectedSprite="selectedSprite = $event"
      />
    </div>
  </div>
</template>

<script>
import Room from "./components/Room.vue";
import Ship from "./components/Ship.vue";
import UILayer from "./components/UILayer.vue";

export default {
  name: "App",
  components: {
    Room,
    Ship,
    UILayer
  },
  data() {
    return {
      selectedShip: "Yamato",
      selectedSprite: "Yamato Summer"
    };
  },
  created() {
    this.$store.dispatch("populateData");
    this.$store.dispatch("startIntervalTimer");
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

  .ui-container {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1000;
  }
}
</style>
