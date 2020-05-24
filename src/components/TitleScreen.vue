<template>
  <div class="title-screen center-div" @click.stop="startGame">
    <img src="img/bg_h.png" :width="screenWidth" />
    <div class="title-foreground center-div">
      <img src="img/kancolle_logo.png" class="title-logo" :width="logoWidth" />
    </div>
    <div class="fade-out-screen" :class="{ 'show': showFadeScreen }" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "TitleScreen",
  data() {
    return {
      screenWidth: null,
      showFadeScreen: false,
      kancolleStartLine: new Audio() // Line for clicking the start button
    };
  },
  computed: {
    ...mapGetters({
      voiceVolume: "voiceVolume",
      titleDB: "titleLines"
    })
  },
  created() {
    this.calculateScreenWidth();
    this.kancolleStartLine.volume = this.voiceVolume;

    // Load a random line from "Kancolle" event
    if (!this.titleDB) {
      return;
    }

    // Set the startLine
    this.kancolleStartLine.src = this.getRandomEventFileNameFromList(
      this.titleDB.Starting.concat(this.titleDB.Kancolle)
    );
    if (this.kancolleStartLine.src) {
      this.kancolleStartLine.load();
      this.kancolleStartLine.onended = () => {
        this.kancolleStartLine.src = "";
        this.kancolleStartLine = null;
      };
    }
    window.addEventListener("resize", this.calculateScreenWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.calculateScreenWidth);
  },
  methods: {
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
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
    },
    calculateScreenWidth() {
      try {
        this.screenWidth = this.calculateWidthFromHeight(
          __room.naturalWidth,
          __room.naturalHeight,
          window.innerHeight
        );
        this.logoWidth = 0.3 * this.screenWidth;
      } catch (e) {
        logError("[TitleScreen] Error in resize. ", e);
      }
    },
    startGame() {
      if (this.showFadeScreen) {
        return;
      }

      this.kancolleStartLine.play();
      this.showFadeScreen = true;
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("startGame"));
      }, 2000);
    }
  }
};
</script>

<style lang="less" scoped>
.title-screen {
  position: relative;
  height: 100%;
  width: 100%;

  .title-foreground {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  .title-logo {
    min-width: 300px;
  }

  .fade-out-screen {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: opacity 2s ease-out;
    background-color: black;

    &.show {
      opacity: 1;
    }
  }
}
</style>
