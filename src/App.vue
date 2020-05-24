<template>
  <div class="app">
    <TitleScreen v-if="titleScreen" />
    <div v-else class="app-contents">
      <Room>
        <Ship />
      </Room>
      <div class="ui-container center-div">
        <UILayer />
      </div>
    </div>
    <div class="loading-screen-container center-div">
      <LoadingScreen v-show="loadingScreen" />
    </div>
  </div>
</template>

<script>
import Room from "./components/Room.vue";
import Ship from "./components/Ship.vue";
import UILayer from "./components/UILayer.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import TitleScreen from "./components/TitleScreen.vue";

export default {
  name: "App",
  components: {
    Room,
    Ship,
    UILayer,
    LoadingScreen,
    TitleScreen
  },
  data() {
    return {
      titleScreen: true,
      loadingScreen: false
    };
  },
  created() {
    this.$store.dispatch("loadSettings");
    this.$store.dispatch("populateData");
    this.$store.dispatch("startIntervalTimer");
    window.addEventListener("startGame", this.exitTitleScreen);
    window.addEventListener("loadComplete", this.loadComplete);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("startGame", this.exitTitleScreen);
    window.removeEventListener("loadComplete", this.loadComplete);
  },
  methods: {
    exitTitleScreen() {
      this.$store.commit("setLoadingMode", true);
      this.loadingScreen = true;
      this.titleScreen = false;
      window.dispatchEvent(new CustomEvent("playLoadLine"));
    },
    loadComplete() {
      this.loadingScreen = false;
      this.$store.commit("setLoadingMode", false);
    }
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

  .app-contents {
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
  }

  .ui-container {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 100;
  }

  .loading-screen-container {
    height: 100%;
    width: 100%;
    pointer-events: none;

    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
  }
}
</style>
