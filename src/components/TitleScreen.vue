<template>
  <div class="title-screen center-div">
    <div class="absolute center-div unclickable">
      <img src="img/bg_h.png" :width="screenWidthPixels" />
    </div>
    <div class="title-foreground center-div">
      <div class="title-foreground-center-container">
        <div class="title-logo-wrapper unclickable">
          <img src="img/kancolle_logo.png" class="title-logo unclickable" :width="logoWidth" />
        </div>

        <div
          class="start-button clickable"
          :style="{ 'margin-top': `${logoMargin}px` }"
          @mouseover="startButtonHover = true"
          @mouseleave="startButtonHover = false"
          @click.stop="startGame"
        >
          <div class="unclickable">
            <img v-if="startButtonClicked" src="img/game_start_button_clicked.png" :width="logoWidth" />
            <img
              v-else-if="startButtonHover"
              src="img/game_start_button_highlighted.png"
              :width="logoWidth"
            />
            <img v-else src="img/game_start_button.png" :width="logoWidth" />
          </div>
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer-container center-div">
      <div class="disclaimer" :style="{ 'max-width': screenWidth }">{{ disclaimer }}</div>
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
      logoWidth: null,
      logoMargin: null,
      showFadeScreen: false,
      startButtonHover: false,
      startButtonClicked: false,

      loadCounter: 0,
      loadLimit: 6,

      kancolleStartLine: new Audio() // Line for clicking the start button
    };
  },
  computed: {
    ...mapGetters({
      voiceVolume: "voiceVolume",
      titleDB: "titleLines",
      disclaimer: "disclaimer"
    }),
    screenWidthPixels() {
      return `${this.screenWidth}px`;
    },
    screenHeightPixels() {
      return `${this.screenHeight}px`;
    }
  },
  created() {
    window.dispatchEvent(new CustomEvent("startLoad"));
    this.calculateScreenWidth();
    this.kancolleStartLine.volume = this.voiceVolume;

    // Load a random line from "Kancolle" event
    if (!this.titleDB) {
      return;
    }

    // Set the startLine
    this.kancolleStartLine.oncanplaythrough = this.onLoad;
    this.kancolleStartLine.src = this.getRandomEventFileNameFromList(
      this.titleDB.TitleCall01
    );
    if (this.kancolleStartLine.src) {
      this.kancolleStartLine.load();
      this.kancolleStartLine.onended = () => {
        this.kancolleStartLine.src = "";
        this.kancolleStartLine = null;
      };
    }

    // Load images
    let imageList = [
      "img/bg_h.png",
      "img/kancolle_logo.png",
      "img/game_start_button_clicked.png",
      "img/game_start_button_highlighted.png",
      "img/game_start_button.png",
    ];
    imageList.forEach(img => this.$store.dispatch('loadImage', {
      imagePath: img,
      postLoad: this.onLoad,
    }))

    window.addEventListener("resize", this.calculateScreenWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.calculateScreenWidth);
  },
  methods: {
    onLoad() {
      this.loadCounter++;
      console.log('Loading', this.loadCounter)
      if (this.loadCounter >= this.loadLimit) {
        window.dispatchEvent(new CustomEvent("endLoad"));
      }
    },
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
        this.screenHeight = window.innerHeight;
        this.logoWidth = Math.min(0.3 * this.screenWidth, window.innerWidth);
        this.logoMargin = window.innerHeight * 0.05;
      } catch (e) {
        logError("[TitleScreen] Error in resize. ", e);
      }
    },
    startGame() {
      if (this.showFadeScreen || this.startButtonClicked) {
        return;
      }

      this.startButtonClicked = true;
      this.showFadeScreen = true;
      this.kancolleStartLine.play();
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

    .title-foreground-center-container {
      justify-content: center;
    }

    .start-button {
      img {
        min-width: 300px;
      }
    }

    .title-logo {
      min-width: 300px;
    }
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
      color: rgba(0, 0, 0, 0.7);
    }
  }

  .fade-out-screen {
    pointer-events: none;
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
