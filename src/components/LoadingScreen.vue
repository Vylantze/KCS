<template>
  <div class="loading-screen-container center-div">
    <div class="loading-screen center-div" :class="{ 'show': showFadeScreen }">
      <img src="img/loading.gif" :width="loaderWidth" />

      <!-- Disclaimer -->
      <div class="disclaimer-container center-div">
        <div class="disclaimer" :style="{ 'max-width': screenWidth }">{{ disclaimer }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "LoadingScreen",
  data() {
    return {
      screenWidth: null,
      showFadeScreen: false,
      loaderWidth: null,
      loadLine: new Audio() // Line for the loading screen (ship bouncing)
    };
  },
  computed: {
    ...mapGetters({
      voiceVolume: "voiceVolume",
      titleDB: "titleLines",
      disclaimer: "disclaimer"
    })
  },
  created() {
    this.loadLine.volume = this.voiceVolume;

    // Load a random line from "Kancolle" event
    if (!this.titleDB) {
      return;
    }

    // Set the loadLine
    this.loadLine.src = this.getRandomEventFileNameFromList(
      this.titleDB.TitleCall02
    );
    this.loadLine.load();
    this.loadLine.onended = () => {
      this.loadLine.src = "";
      this.loadLine = null;
      window.dispatchEvent(new CustomEvent("loadLineEnded"));
    };

    this.calculateGifWidth();

    window.addEventListener("playLoadLine", this.playLoadLine);
    window.addEventListener("resize", this.calculateGifWidth);
    window.addEventListener("showFadeScreen", this.showFadeScreenFunc);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.calculateGifWidth);
    window.removeEventListener("playLoadLine", this.playLoadLine);
    window.removeEventListener("showFadeScreen", this.showFadeScreenFunc);
  },
  methods: {
    playLoadLine() {
      console.log("[LoadingScreen] Playing load line");
      this.loadLine.play();
    },
    showFadeScreenFunc() {
      this.showFadeScreen = true;
      window.setTimeout(() => {
        this.showFadeScreen = false;
      }, 3000);
    },
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
    },
    calculateGifWidth() {
      try {
        this.screenWidth = this.calculateWidthFromHeight(
          __room.naturalWidth,
          __room.naturalHeight,
          window.innerHeight
        );
        this.loaderWidth = this.screenWidth * 0.15;
      } catch (e) {
        logError("[TitleScreen] Error in resize. ", e);
      }
    },
    getRandomEventFileNameFromList(list) {
      if (!list || list.length == 0) {
        return "";
      }
      try {
        let currentEvent = list[Math.floor(Math.random() * list.length)];
        return currentEvent.File;
      } catch (e) {
        window.logError(
          "[TitleScreen] Error in 'getRandomEventFileNameFromList'.",
          e
        );
      }
    }
  }
};
</script>

<style lang="less" scoped>
.loading-screen {
  position: relative;
  height: 100%;
  width: 100%;
  opacity: 1;
  transition: opacity 1.5s ease-out;
  background-color: black;
  pointer-events: none;

  img {
    min-width: 150px;
  }

  &.show {
    opacity: 0;
  }

  .disclaimer-container {
    pointer-events: none;
    position: absolute;
    bottom: 2%;
    left: 0px;
    max-width: 100%;
    width: 100%;

    .disclaimer {
      pointer-events: none;
      text-align: center;
      margin: 0px 10px;
      font-size: 0.7em; //2vmin;

      padding: 5px;
      color: rgba(255, 255, 255, 0.2);
    }
  }
}

.loading-screen-container {
  height: 100%;
  width: 100%;

  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  display: block;
}
</style>
