<template>
  <div class="loading-screen center-div" :class="{ 'show': showFadeScreen }">
    <img src="img/loading.gif" :width="loaderWidth" />
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
      titleDB: "titleLines"
    })
  },
  created() {
    this.loadLine.volume = this.voiceVolume;

    // Load a random line from "Kancolle" event
    if (!this.titleDB) {
      return;
    }

    let loadList = this.titleDB.AkatsukiSuihesen.concat(
      this.titleDB.TTKEntering,
      this.titleDB.Yoroshiku
    );

    // Set the loadLine
    this.loadLine.src = this.getRandomEventFileNameFromList(loadList);
    this.loadLine.load();
    this.loadLine.onended = () => {
      this.loadLine.src = "";
      this.loadLine = null;
      this.showFadeScreen = true;
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("loadComplete"));
      }, 2000);
    };

    this.calculateGifWidth();

    window.addEventListener("playLoadLine", this.playLoadLine);
    window.addEventListener("resize", this.calculateGifWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.calculateGifWidth);
    window.removeEventListener("playLoadLine", this.playLoadLine);
  },
  methods: {
    playLoadLine() {
      this.loadLine.play();
    },
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
    },
    calculateGifWidth() {
      try {
        this.loaderWidth =
          0.15 *
          this.calculateWidthFromHeight(
            __room.naturalWidth,
            __room.naturalHeight,
            window.innerHeight
          );
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

  img {
    min-width: 150px;
  }

  &.show {
    opacity: 0;
  }
}
</style>
