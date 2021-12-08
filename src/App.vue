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
    <LoadingScreen v-show="loadingScreen" />
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
      loadingScreen: false,

      roomLoaded: false,
      shipLoaded: false,
      lineEnded: false,
    };
  },
  created() {
    this.$store.dispatch("loadSettings");
    this.$store.dispatch("populateData");
    this.$store.dispatch("startEventListeners");
    this.$store.dispatch("startIntervalTimer");
    window.addEventListener("startGame", this.exitTitleScreen);
    window.addEventListener("startLoad", this.startLoad);
    window.addEventListener("endLoad", this.endLoad);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("startGame", this.exitTitleScreen);
    window.removeEventListener("startLoad", this.startLoad);
    window.removeEventListener("endLoad", this.endLoad);
  },
  methods: {
    onLoad(item) {
      console.log(`[App] ${item} loaded`);
      switch(item) {
        case "room": 
          this.roomLoaded = true;
          break;
        case "ship": 
          this.shipLoaded = true;
          break;
        case "lineEnd": 
          this.lineEnded = true;
          break;
        default:
          break;
      }
      if (this.roomLoaded && this.shipLoaded && this.lineEnded) {
        window.removeEventListener("roomLoaded", this.onRoomLoad);
        window.removeEventListener("shipLoaded", this.onShipLoad);
        window.removeEventListener("loadLineEnded", this.onLoadLineEnded);
        
        window.dispatchEvent(new CustomEvent("showFadeScreen"));
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent("endLoad"));
          this.$store.dispatch("preloadShipCards");
        }, 2000);
      }
    },
    onRoomLoad() {
      this.onLoad("room")
    },
    onShipLoad() {
      this.onLoad("ship")
    },
    onLoadLineEnded() {
      this.onLoad("lineEnd")
    },
    exitTitleScreen() {
      this.startLoad();
      window.addEventListener("roomLoaded", this.onRoomLoad);
      window.addEventListener("shipLoaded", this.onShipLoad);
      window.addEventListener("loadLineEnded", this.onLoadLineEnded);

      this.titleScreen = false;
      window.dispatchEvent(new CustomEvent("playLoadLine")); // Only play when entering game after title screen
    },
    startLoad() {
      this.$store.commit("setLoadingMode", true);
      this.loadingScreen = true;
    },
    endLoad() {
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
}
</style>
