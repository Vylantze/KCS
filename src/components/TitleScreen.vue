<template>
  <div class="title-screen center-div">
    <div class="background-image">
      <img src="img/bg_h.png" height="100%" />
    </div>
    <div class="title-foreground center-div">
      <div class="title-foreground-center-container">
        <div class="title-logo-wrapper unclickable">
          <img 
            src="img/kancolle_logo.png" 
            class="title-logo unclickable"
            :class="{ 'min-mode': belowMin }"
            :style="{ 'width': logoWidth, 'max-height': logoMaxHeight, 'max-width': `${maxWidth}px` }" 
          />
        </div>

        <div class="center-div">
          <div
            class="start-button center-div clickable"
            :class="{ 'min-mode': belowMin }"
            :style="{ 'margin-top': `${logoMargin}px`, 'width': logoWidth, }"
            @mouseover="startButtonHover = true"
            @mouseleave="startButtonHover = false"
            @click.stop="startGame"
          >
            <img 
              v-if="startButtonClicked"
              class="unclickable"
              src="img/game_start_button_clicked.png"
              width="100%"
              :style="{ 'max-width': `${maxWidth}px` }" 
            />
            <img
              v-else-if="startButtonHover"
              class="unclickable"
              src="img/game_start_button_highlighted.png"
              width="100%"
              :style="{ 'max-width': `${maxWidth}px` }" 
            />
            <img v-else
              class="unclickable"
              src="img/game_start_button.png"
              width="100%"
              :style="{ 'max-width': `${maxWidth}px` }" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div class="disclaimer-container center-div" :class="{ 'min-mode': belowMin }">
      <div class="disclaimer" :style="{ 'max-width': `${maxWidth}px` }">{{ disclaimer }}</div>
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
      screenHeight: null,

      logoWidth: null,
      logoMaxHeight: null, 
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
    screenHeightPixels() {
      return `${this.screenHeight}px`;
    },
    belowMinWidth() {
      return this.screenWidth < window.__minSize.width;
    },
    belowMinHeight() {
      return this.screenHeight < window.__minSize.height;
    },
    belowMin() {
      return this.belowMinWidth || this.belowMinHeight;
    },
    maxWidth() {
      return this.screenHeight / 720.0 * 1200.0;
    },
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
    this.kancolleStartLine.oncanplaythrough = () => {
      this.onLoad("audio");
    };
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
      postLoad: () => {
        this.onLoad(img);
      },
    }))

    window.addEventListener("resize", this.calculateScreenWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.calculateScreenWidth);
  },
  methods: {
    onLoad(loadedItem) {
      this.loadCounter++;
      console.log("[TitleScreen] Loaded", loadedItem);
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
        this.screenWidth = window.innerWidth;
        this.logoWidth = this.belowMin ? "50%" : `${Math.min(0.3 * this.screenWidth, window.innerWidth)}px`;
        this.logoMaxHeight = this.belowMin ? "25%" : null;
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

  .background-image {
    pointer-events: none;
    position: absolute;
    height: 100%;
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
  }

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

      &.min-mode {
        margin: 10 0;

        img {
          min-width: 0px;
        }
      }
    }

    .title-logo-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .title-logo {
      min-width: 300px;
      width: 100%;

      &.min-mode {
        min-width: 0px;
      }
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
      word-wrap: break-word;
      width: 100%;

      padding: 5px;
      color: rgba(0, 0, 0, 0.7);
    }

    &.min-mode {
      display: none;
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
