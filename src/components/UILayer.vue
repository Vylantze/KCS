<template>
  <div class="ui-layer" :style="{ width: `${uiWidth}px` }">
    <div v-if="menuOpen" class="menu-closer">
      <div v-if="menuOpen == 'settings'" class="menu center limit-size">
        <div class="settings">
          <h3>Volume</h3>
          <div>
            <div class="slider-setting">
              <div class="label">Overall</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="overallSlider" class="slider" />
              </div>
              <div class="label right">{{ Math.floor(overallVolume * 100) }}%</div>
            </div>

            <div class="slider-setting">
              <div class="label">BGM</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="bgmSlider" class="slider" />
              </div>
              <div class="label right">{{ Math.floor(bgmVolume * 100) }}%</div>
            </div>

            <div class="slider-setting">
              <div class="label">SE</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="seSlider" class="slider" />
              </div>
              <div class="label right">{{ Math.floor(seVolume * 100) }}%</div>
            </div>

            <div class="slider-setting">
              <div class="label">Voice</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="voiceSlider" class="slider" />
              </div>
              <div class="label right">{{ Math.floor(voiceVolume * 100) }}%</div>
            </div>
          </div>

          <h3>Ship</h3>
          <div>
            <div class="ship-setting" :class="{ disabled: useSpecialLinesOnly }">
              <div class="label">Use equipment changing and resupply lines as tap lines.</div>
              <div>
                <div
                  class="checkbox"
                  :class="{ unchecked: !useBonusLines }"
                  @click="toggleBonusLines"
                >
                  <span>✅</span>
                </div>
              </div>
            </div>
            <div class="ship-setting">
              <div class="label">Turn on ship's special occasion lines.</div>
              <div>
                <div
                  class="checkbox"
                  :class="{ unchecked: !useSpecialLines }"
                  @click="toggleSpecialLines"
                >
                  <span>✅</span>
                </div>
              </div>
            </div>
            <div class="ship-setting" :class="{ disabled: !useSpecialLines }">
              <div class="sub-label">↪ Only use special occasion lines.</div>
              <div>
                <div
                  class="checkbox"
                  :class="{ unchecked: !useSpecialLinesOnly }"
                  @click="toggleUseSpecialLinesOnly"
                >
                  <span>✅</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <h3>Misc</h3>
          <div class="d-flex">
            <button class="standard-button info" @click="openBgm">Change BGM</button>
            <button
              class="standard-button"
              :class="{ 'info': hideButtons, 'danger': !hideButtons }"
              style="margin-left: 5px"
              @click="toggleHideButtons()"
            >
              <div style="width: 60px">{{ hideButtons ? "Show" : "Hide" }} UI</div>
            </button>
          </div>
        </div>
      </div>

      <div v-if="menuOpen == 'composition'" class="menu center-div">
        <ShipAssigner
          @shipChanged="shipChanged()"
          @closeMenu="closeMenu()"
          @buttonPress="genericButtonPress()"
        />
      </div>

      <div v-if="menuOpen == 'bgm'" class="menu center-div">
        <BGM @buttonPress="genericButtonPress()" />
      </div>

      <div class="back-button-holder center-div">
        <button v-if="menuOpen == 'bgm'" class="standard-button info" @click="openSettings">Back</button>
        <button
          v-else-if="Boolean(menuOpen)"
          class="standard-button info"
          @click="closeMenu()"
        >Close</button>
      </div>
    </div>

    <!-- Sortie button -->
    <div
      class="sortie-button clickable"
      :class="{ 'set-transparent': hideButtons }"
      @mouseover="sortieButtonHover = true"
      @mouseleave="sortieButtonHover = false"
      @click="sortieShip"
    >
      <img v-show="!sortieButtonHover" src="img/sortie_button.png" :width="sortieButtonWidth" />
      <img
        v-show="sortieButtonHover"
        src="img/sortie_button_highlight.png"
        :width="sortieButtonWidth"
      />
    </div>

    <!-- Ship change button -->
    <div
      class="composition-button clickable"
      :class="{ 'set-transparent': hideButtons }"
      @mouseover="compositionButtonHover = true"
      @mouseleave="compositionButtonHover = false"
      :style="{ bottom: `${13 + Math.max(compositionButtonHeight * 1.5, compositionButtonMinHeight)}px` }"
      @click="changeShip"
    >
      <img
        v-show="!compositionButtonHover"
        src="img/composition_button.png"
        :width="compositionButtonWidth"
      />
      <div v-show="compositionButtonHover" class="fixed" style="pointer-events: none;">
        <img src="img/highlight_button.png" :width="compositionButtonWidth" />
        <img
          src="img/composition_button_highlight.png"
          class="absolute"
          style="top: 0; left: 0;"
          :width="compositionButtonWidth"
        />
      </div>
    </div>

    <!-- Repair button -->
    <div
      class="repair-button clickable"
      :class="{ 'set-transparent': hideButtons }"
      @mouseover="repairButtonHover = true"
      @mouseleave="repairButtonHover = false"
      :style="{ left: `${16 + Math.max(compositionButtonWidth * 1.5, compositionButtonMinWidth)}px` }"
      @click="repairShip"
    >
      <img v-show="!repairButtonHover" src="img/docking_button.png" :width="repairButtonWidth" />
      <div v-show="repairButtonHover" class="fixed" style="pointer-events: none;">
        <img src="img/highlight_button.png" :width="compositionButtonWidth" />
        <img
          src="img/docking_button_highlight.png"
          class="absolute"
          style="top: 0; left: 0;"
          :width="compositionButtonWidth"
        />
      </div>
    </div>

    <!-- Settings menu button -->
    <div
      class="settings-button clickable center-div"
      :class="{ 'set-transparent': hideButtons }"
      @mouseover="settingsButtonHover = true"
      @mouseleave="settingsButtonHover = false"
      @click="openSettings"
    >
      <img v-show="!settingsButtonHover" src="img/settings.png" />
      <img v-show="settingsButtonHover" src="img/settings_highlighted.png" />
    </div>

    <!-- Subtitles -->
    <div class="subtitles-container center-div">
      <div
        v-show="Boolean(subtitle)"
        class="subtitles"
        :style="{ 'max-width': subtitleMaxWidth }"
      >{{ subtitle }}</div>
    </div>

    <!-- Top left title -->
    <div class="title-container">
      <div v-show="Boolean(title)" class="title">{{ title }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

import BGM from "./BGM.vue";
import ShipAssigner from "./ShipAssigner.vue";

export default {
  name: "UILayer",
  components: {
    BGM,
    ShipAssigner
  },
  data() {
    return {
      seAudio: new Audio(),

      compositionButtonWidth: null,
      compositionButtonHeight: null,
      compositionButtonMinWidth: 90,
      compositionButtonMinHeight: (90 / 249.0) * 198,
      sortieButtonWidth: null,
      repairButtonWidth: null,
      subtitleMaxWidth: null,

      uiWidth: null,
      menuOpen: null,
      hideButtons: false,

      compositionButtonHover: false,
      sortieButtonHover: false,
      repairButtonHover: false,
      settingsButtonHover: false
    };
  },
  computed: {
    ...mapGetters({
      subtitle: "subtitle",
      title: "title",
      seDB: "SEs",
      useSpecialLines: "useSpecialLines",
      useSpecialLinesOnly: "useSpecialLinesOnly",
      useBonusLines: "useBonusLines"
    }),
    ...mapState({
      overallVolume: s => s.main.overallVolume,
      bgmVolume: s => s.main.bgmVolume,
      seVolume: s => s.main.seVolume,
      voiceVolume: s => s.main.voiceVolume
    }),
    overallSlider: {
      get() {
        return this.overallVolume * 100;
      },
      set(value) {
        this.$store.commit("setOverallVolume", value / 100.0);
      }
    },
    bgmSlider: {
      get() {
        return this.bgmVolume * 100;
      },
      set(value) {
        this.$store.commit("setBgmVolume", value / 100.0);
      }
    },
    seSlider: {
      get() {
        return this.seVolume * 100;
      },
      set(value) {
        this.$store.commit("setSeVolume", value / 100.0);
      }
    },
    voiceSlider: {
      get() {
        return this.voiceVolume * 100;
      },
      set(value) {
        this.$store.commit("setVoiceVolume", value / 100.0);
      }
    }
  },
  watch: {
    seVolume() {
      this.seAudio.volume = this.seVolume;
    }
  },
  async mounted() {
    this.resizeUI();
    window.addEventListener("resize", this.resizeUI);

    this.seAudio.volume = this.seVolume;
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeUI);
  },
  methods: {
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
    },
    closeMenu(suppressAudio) {
      if (!suppressAudio) {
        this.playSeAudio(this.seDB["Return"]);
      }
      this.menuOpen = null;
    },
    genericButtonPress() {
      this.playSeAudio(this.seDB["Accept/Cancel Quest"]);
    },
    shipChanged() {
      this.playSeAudio(this.seDB["Assigning Ship"]);
      this.closeMenu(true);
    },
    openMenu(name) {
      if (this.menuOpen != name) {
        this.menuOpen = name;
        return true;
      } else {
        this.closeMenu();
        return false;
      }
    },
    openSettings() {
      if (this.openMenu("settings")) {
        this.playSeAudio(this.seDB["Return"]);
      }
    },
    openBgm() {
      if (this.openMenu("bgm")) {
        this.playSeAudio(this.seDB["Accept/Cancel Quest"]);
      }
    },
    toggleHideButtons() {
      this.playSeAudio(this.seDB["Accept/Cancel Quest"]);
      this.hideButtons = !this.hideButtons;
    },
    resizeUI() {
      try {
        this.uiWidth = this.calculateWidthFromHeight(
          __room.naturalWidth,
          __room.naturalHeight,
          window.innerHeight
        );
        let widthToUse = Math.min(this.uiWidth, window.innerWidth);
        this.subtitleMaxWidth = widthToUse < 500 ? null : "60%";
        this.compositionButtonWidth = widthToUse * 0.1;
        this.compositionButtonHeight =
          (this.compositionButtonWidth / 249.0) * 198;
        this.sortieButtonWidth = widthToUse * 0.15;
        this.repairButtonWidth = widthToUse * 0.1;
      } catch (e) {
        window.logError("[App] Error in resize. ", e);
      }
    },
    changeShip() {
      if (this.openMenu("composition")) {
        this.playSeAudio(this.seDB["Select"]);
      }
    },
    sortieShip() {
      this.playSeAudio(this.seDB["Select"]);
    },
    repairShip() {
      this.playSeAudio(this.seDB["Resupply"]);
    },
    toggleBonusLines() {
      if (!this.useSpecialLinesOnly) {
        this.playSeAudio(this.seDB["Accept/Cancel Quest"]);
        this.$store.commit("setUseBonusLines", !this.useBonusLines);
      }
    },
    toggleSpecialLines() {
      this.playSeAudio(this.seDB["Accept/Cancel Quest"]);
      this.$store.commit("setUseSpecialLines", !this.useSpecialLines);
    },
    toggleUseSpecialLinesOnly() {
      // Only allow change if special lines is active
      if (this.useSpecialLines) {
        this.playSeAudio(this.seDB["Accept/Cancel Quest"]);
        this.$store.commit("setUseSpecialLinesOnly", !this.useSpecialLinesOnly);
      }
    },
    playSeAudio(seFile) {
      if (!seFile) {
        return;
      }

      if (this.seAudio) {
        this.seAudio.pause();
      }

      this.seAudio.src = seFile;
      this.seAudio.load();
      this.seAudio.play();
    }
  }
};
</script>

<style lang="less" scoped>
.ui-layer {
  position: relative;
  height: 100%;

  .set-transparent {
    opacity: 0;
  }

  div {
    pointer-events: auto;
  }

  .slider-setting {
    display: flex;
    margin-bottom: 5px;

    .label {
      display: flex;
      align-items: center;
      width: 60px;

      &.right {
        width: 45px;
        justify-content: flex-end;
      }
    }
  }

  .ship-setting {
    display: flex;
    margin-bottom: 5px;

    .label {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .sub-label {
      margin-left: 10px;
      flex: 1;
    }

    .checkbox {
      background-color: black;
      display: flex;
      align-items: center;

      &.unchecked {
        span {
          opacity: 0;
        }
      }
    }
  }

  .slider-holder {
    flex: 1;

    .slider {
      -webkit-appearance: none;
      width: 100%;
      height: 5px;
      border-radius: 5px;
      background: #d3d3d3;
      outline: none;
      opacity: 0.7;
      -webkit-transition: 0.2s;
      transition: opacity 0.2s;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4caf50;
      cursor: pointer;
    }

    .slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4caf50;
      cursor: pointer;
    }
  }

  .menu-closer {
    position: relative;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .back-button-holder {
      position: absolute;
      top: calc(65% + 20px);
      width: 100%;
    }

    ::-webkit-scrollbar {
      display: block;
      width: 0.4em;
      height: 0.4em;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #888;
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
      background: #d1d1d1;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #f1f1f1;
    }
  }

  .menu {
    position: relative;
    margin: 10px auto;
    background-color: rgba(0, 0, 0, 0.7);
    width: 80%;
    height: 65%;
    color: white;

    overflow-y: auto;

    &.center {
      display: flex;
      justify-content: center;
    }

    &.limit-size {
      max-width: 500px;
    }
  }

  .settings {
    padding: 0px 20px;
    max-width: 500px;
    flex: 1;
  }

  .title-container {
    pointer-events: none;
    position: absolute;
    top: 0px;
    left: 0px;
    max-width: 100%;
    width: 100%;

    display: flex;

    .title {
      pointer-events: none;
      text-align: center;
      margin: 10px;
      font-size: 4vmin;

      padding: 5px 10px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
    }
  }

  .subtitles-container {
    pointer-events: none;
    position: absolute;
    bottom: 2%;
    left: 0px;
    max-width: 100%;
    width: 100%;

    .subtitles {
      pointer-events: none;
      text-align: center;
      margin: 0px 10px;
      font-size: 4vmin;

      padding: 5px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
    }
  }

  .sortie-button {
    position: absolute;
    bottom: 8px;
    left: 16px;

    img {
      min-width: 90px;
    }
  }

  .composition-button {
    position: absolute;
    bottom: 8px;
    left: 16px;

    img {
      min-width: 60px;
    }
  }

  .repair-button {
    position: absolute;
    bottom: 8px;
    left: 16px;

    img {
      min-width: 60px;
    }
  }

  .settings-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    //background-color: #20a0a3;
    //border-radius: 50%;
    //height: 40px;
    //width: 40px;

    img {
      width: 40px;
    }
  }
}
</style>