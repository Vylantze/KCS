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
              <div class="volume-icon" @click.stop="toggleMuteOverall">
                <img v-show="!overallVolumeMute" src="img/volume.png" />
                <img v-show="overallVolumeMute" src="img/volume_mute.png" />
              </div>
              <div class="label right">{{ Math.floor(overallVolume * 100) }}%</div>
            </div>

            <div class="slider-setting">
              <div class="label">BGM</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="bgmSlider" class="slider" />
              </div>
              <div class="volume-icon" @click.stop="toggleMuteBgm">
                <img v-show="!bgmVolumeMute" src="img/volume.png" />
                <img v-show="bgmVolumeMute" src="img/volume_mute.png" />
              </div>
              <div class="label right">{{ Math.floor(bgmVolume * 100) }}%</div>
            </div>

            <div class="slider-setting">
              <div class="label">SE</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="seSlider" class="slider" />
              </div>
              <div class="volume-icon" @click.stop="toggleMuteSe">
                <img v-show="!seVolumeMute" src="img/volume.png" />
                <img v-show="seVolumeMute" src="img/volume_mute.png" />
              </div>
              <div class="label right">{{ Math.floor(seVolume * 100) }}%</div>
            </div>

            <div class="slider-setting">
              <div class="label">Voice</div>
              <div class="slider-holder center-div">
                <input type="range" min="0" max="100" v-model="voiceSlider" class="slider" />
              </div>
              <div class="volume-icon" @click.stop="toggleMuteVoice">
                <img v-show="!voiceVolumeMute" src="img/volume.png" />
                <img v-show="voiceVolumeMute" src="img/volume_mute.png" />
              </div>
              <div class="label right">{{ Math.floor(voiceVolume * 100) }}%</div>
            </div>
          </div>

          <h3>Ship</h3>
          <div>
            <div class="ship-setting">
              <div
                class="label"
              >Enable any line from all models to be used regardless of current ship model.</div>
              <div>
                <div
                  class="checkbox"
                  :class="{ unchecked: !useAllModelLines }"
                  @click="toggleAllModelLines"
                >
                  <span>✅</span>
                </div>
              </div>
            </div>

            <div class="ship-setting" :class="{ disabled: useSpecialLinesOnly }">
              <div
                class="label"
              >Enable miscellaneous lines (like equipment and resupply) as bonus lines.</div>
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
              <div class="label">Enable ship's special occasion lines.</div>
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

            <div class="ship-setting" :class="{ disabled: useSpecialLinesOnly }">
              <div class="label">Enable Idle lines.</div>
              <div>
                <div
                  class="checkbox"
                  :class="{ unchecked: !useIdleLines }"
                  @click="toggleIdleLines"
                >
                  <span>✅</span>
                </div>
              </div>
            </div>
            <div class="slider-setting" :class="{ disabled: useSpecialLinesOnly || !useIdleLines }">
              <div class="label">Idle</div>
              <div class="slider-holder center-div">
                <input
                  type="range"
                  min="1"
                  max="12"
                  v-model="idleLineWaitSlider"
                  class="slider"
                  :class="{ disabled: useSpecialLinesOnly || !useIdleLines }"
                />
              </div>
              <div class="label right" style="margin-left: 10px;">{{ Math.floor(idleLineWait) }} min</div>
            </div>
          </div>

          <!-- Buttons -->
          <h3>Misc</h3>
          <div class="d-flex" style="margin-bottom: 20px;">
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

      <div v-if="menuOpen == 'composition'" class="menu center-div composition">
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


    <div class="button-wrapper" :class="{ 'min-mode': belowMin }">
      <div class="buttons-left">
        <!-- Sortie button -->
        <div
          class="sortie-button"
          :class="{ 'set-transparent': hideButtons, disabled: disableSortieButton, clickable: !disableSortieButton, 'min-mode': belowMin }"
          @mouseover="setButtonHoverState('sortieButtonHover', true)"
          @mouseleave="setButtonHoverState('sortieButtonHover', false)"
          @click="sortieShip"
        >
          <img v-show="!sortieButtonHover" src="img/sortie_button.png" :width="sortieButtonWidth" />
          <div v-show="sortieButtonHover" class="fixed" style="pointer-events: none;">
            <img src="img/sortie_button_highlighted_part1.png" :width="sortieButtonWidth" />
            <img
              src="img/sortie_button_highlighted_part2.png"
              class="absolute highlight-button"
              style="top: 0; left: 0;"
              :width="sortieButtonWidth"
            />
            <img
              src="img/sortie_button_highlighted_part3.png"
              class="absolute"
              style="top: 0; left: 0;"
              :width="sortieButtonWidth"
            />
          </div>
        </div>

        <!-- Ship change button -->
        <div
          v-if="!combatMode"
          class="composition-button"
          :class="{ 'set-transparent': hideButtons, disabled: disableCompositionButton, clickable: !disableCompositionButton, 'min-mode': belowMin }"
          @mouseover="setButtonHoverState('compositionButtonHover', true)"
          @mouseleave="setButtonHoverState('compositionButtonHover', false)"
          :style="{ bottom: belowMin ? '0px' : `${13 + Math.max(compositionButtonHeight * 1.5, compositionButtonMinHeight)}px` }"
          @click="changeShip"
        >
          <img
            v-show="!compositionButtonHover"
            src="img/composition_button.png"
            :width="compositionButtonWidth"
          />
          <div v-show="compositionButtonHover" class="fixed" style="pointer-events: none;">
            <img
              src="img/highlight_button.png"
              class="highlight-button"
              :width="compositionButtonWidth"
            />
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
          v-if="!combatMode"
          class="repair-button"
          :class="{ 'set-transparent': hideButtons, disabled: disableRepairButton, clickable: !disableRepairButton, 'min-mode': belowMin }"
          @mouseover="setButtonHoverState('repairButtonHover', true)"
          @mouseleave="setButtonHoverState('repairButtonHover', false)"
          :style="{ left: belowMin ? '0px' : `${16 + Math.max(compositionButtonWidth * 1.5, compositionButtonMinWidth)}px` }"
          @click="repairShip"
        >
          <img v-show="!repairButtonHover" src="img/docking_button.png" :width="repairButtonWidth" />
          <div v-show="repairButtonHover" class="fixed" style="pointer-events: none;">
            <img
              src="img/highlight_button.png"
              class="highlight-button"
              :width="compositionButtonWidth"
            />
            <img
              src="img/docking_button_highlight.png"
              class="absolute"
              style="top: 0; left: 0;"
              :width="compositionButtonWidth"
            />
          </div>
        </div>
      </div>

      <div class="buttons-center" />
      
      <div class="buttons-right">
        <!-- Settings menu button -->
        <div
          class="settings-button clickable center-div"
          :class="{ 'set-transparent': hideButtons, 'min-mode': belowMin }"
          @mouseover="settingsButtonHover = true"
          @mouseleave="settingsButtonHover = false"
          @click="openSettings"
        >
          <img v-show="!settingsButtonHover" src="img/settings.png" />
          <img v-show="settingsButtonHover" src="img/settings_highlighted.png" />
        </div>
      </div>
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
      audio: {},

      compositionButtonWidth: null,
      compositionButtonHeight: null,
      compositionButtonMinWidth: 90,
      compositionButtonMinHeight: (90 / 249.0) * 198,
      sortieButtonWidth: null,
      repairButtonWidth: null,
      subtitleMaxWidth: null,

      uiWidth: null,
      windowWidth: null,
      windowHeight: null,
      menuOpen: null,
      hideButtons: false,

      compositionButtonHover: false,
      sortieButtonHover: false,
      repairButtonHover: false,
      settingsButtonHover: false,

      disableShipButtons: false,
      disableShipComposition: false,
      disableShipRepair: false,
      disableShipSortie: false
    };
  },
  computed: {
    ...mapGetters({
      subtitle: "subtitle",
      title: "title",
      seDB: "SEs",

      useAllModelLines: "useAllModelLines",
      useIdleLines: "useIdleLines",
      useSpecialLines: "useSpecialLines",
      useSpecialLinesOnly: "useSpecialLinesOnly",
      useBonusLines: "useBonusLines",

      finalSeVolume: "seVolume",

      combatMode: "combatMode",
      damagedMode: "damagedMode"
    }),
    ...mapState({
      overallVolume: s => s.main.overallVolume,
      bgmVolume: s => s.main.bgmVolume,
      seVolume: s => s.main.seVolume,
      voiceVolume: s => s.main.voiceVolume,

      overallVolumeMute: s => s.main.overallVolumeMute,
      bgmVolumeMute: s => s.main.bgmVolumeMute,
      seVolumeMute: s => s.main.seVolumeMute,
      voiceVolumeMute: s => s.main.voiceVolumeMute,

      idleLineWait: s => s.main.idleLineWait
    }),
    disableSortieButton() {
      return this.disableShipButtons || this.disableShipSortie || this.menuOpen;
    },
    disableCompositionButton() {
      return this.disableShipButtons || this.disableShipComposition || this.menuOpen;
    },
    belowMinWidth() {
      return this.windowWidth < window.__minSize.width;
    },
    belowMinHeight() {
      return this.windowHeight < window.__minSize.height;
    },
    belowMin() {
      return this.belowMinWidth || this.belowMinHeight;
    },
    disableRepairButton() {
      return (
        this.disableShipButtons ||
        this.disableShipRepair ||
        this.menuOpen
      );
    },
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
    },
    idleLineWaitSlider: {
      get() {
        return this.idleLineWait / 5;
      },
      set(value) {
        this.$store.commit("setIdleLineWait", value * 5);
      }
    }
  },
  watch: {
    finalSeVolume() {
      Object.keys(this.audio).map(key => {
        this.audio[key].volume = this.finalSeVolume;
      });
    },
    combatMode() {
      this.disableShipButtons = false;
      this.disableShipComposition = false;
      this.disableShipRepair = false;
    }
  },
  created() {
    this.createSeAudio();
  },
  async mounted() {
    this.resizeUI();
    window.addEventListener("resize", this.resizeUI);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeUI);

    Object.keys(this.audio).map(key => {
      this.audio[key].pause();
      this.audio[key].src = "";
      this.audio[key] = null;
    });
    this.audio = null;
  },
  methods: {
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
    },
    closeMenu(suppressAudio) {
      if (!suppressAudio) {
        this.playSeAudio("Return");
      }
      this.menuOpen = null;
    },
    createSeAudio() {
      if (!this.seDB) {
        logError("[UILayer][createSeAudio] seDB not found");
        return;
      }
      Object.keys(this.seDB).map(key => {
        this.audio[key] = new Audio();
        this.audio[key].volume = this.finalSeVolume;
        this.audio[key].src = this.seDB[key];
        this.audio[key].load();
      });
    },
    genericButtonPress() {
      this.playSeAudio("Accept/Cancel Quest");
    },
    shipChanged() {
      this.playSeAudio("Assigning Ship");
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
        this.playSeAudio("Return");
      }
    },
    openBgm() {
      if (this.openMenu("bgm")) {
        this.playSeAudio("Accept/Cancel Quest");
      }
    },
    toggleMuteOverall() {
      this.$store.commit("setOverallVolumeMute", !this.overallVolumeMute);
      this.playSeAudio("Unlocking Ship/Equipment");
    },
    toggleMuteBgm() {
      this.$store.commit("setBgmVolumeMute", !this.bgmVolumeMute);
      this.playSeAudio("Unlocking Ship/Equipment");
    },
    toggleMuteSe() {
      this.$store.commit("setSeVolumeMute", !this.seVolumeMute);
      this.playSeAudio("Unlocking Ship/Equipment");
    },
    toggleMuteVoice() {
      this.$store.commit("setVoiceVolumeMute", !this.voiceVolumeMute);
      this.playSeAudio("Unlocking Ship/Equipment");
    },
    toggleHideButtons() {
      this.playSeAudio("Accept/Cancel Quest");
      this.hideButtons = !this.hideButtons;
    },
    resizeUI() {
      try {
        this.uiWidth = this.calculateWidthFromHeight(
          __room.naturalWidth,
          __room.naturalHeight,
          window.innerHeight
        );
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        let widthToUse = Math.min(this.uiWidth, window.innerWidth);
        this.subtitleMaxWidth = widthToUse < 500 ? null : "60%";
        this.compositionButtonWidth = this.belowMin ? "100%" : widthToUse * 0.1;
        this.compositionButtonHeight = this.belowMin ? null : 
          (this.compositionButtonWidth / 249.0) * 198;
        this.sortieButtonWidth = this.belowMin ? "100%" : widthToUse * 0.15;
        this.repairButtonWidth = this.belowMin ? "100%" : widthToUse * 0.1;
      } catch (e) {
        window.logError("[App] Error in resize. ", e);
      }
    },
    setButtonHoverState(buttonName, state) {
      let relation = {
        sortieButtonHover: "disableSortieButton",
        compositionButtonHover: "disableCompositionButton",
        repairButtonHover: "disableRepairButton"
      };

      // If the button corresponding does not exist, return
      if (!relation[buttonName]) {
        return;
      }
      let disabled = this[relation[buttonName]];
      if (!disabled) {
        this[buttonName] = state;
      }
    },
    changeShip() {
      if (this.disableCompositionButton) {
        return;
      }
      this.setButtonHoverState('compositionButtonHover', false);
      if (this.openMenu("composition")) {
        this.playSeAudio("Select");
      }
    },
    sortieShip() {
      if (this.disableSortieButton) {
        return;
      }
      this.setButtonHoverState('sortieButtonHover', false);
      this.disableShipButtons = true;
      this.disableShipComposition = true;
      this.disableShipRepair = true;

      this.sortieButtonHover = false;

      this.playSeAudio("Select");
      if (!this.combatMode) {
        window.dispatchEvent(new CustomEvent("battleStart"));
      } else {
        window.dispatchEvent(new CustomEvent("battleEnd"));
      }
    },
    repairShip() {
      if (this.disableRepairButton) {
        return;
      }
      this.setButtonHoverState('repairButtonHover', false);
      this.playSeAudio("Resupply");
      this.$store.commit("setDamagedMode", !this.damagedMode);
    },
    toggleAllModelLines() {
      this.playSeAudio("Accept/Cancel Quest");
      this.$store.commit("setUseAllModelLines", !this.useAllModelLines);
    },
    toggleIdleLines() {
      if (!this.useSpecialLinesOnly) {
        this.playSeAudio("Accept/Cancel Quest");
        this.$store.commit("setUseIdleLines", !this.useIdleLines);
      }
    },
    toggleBonusLines() {
      if (!this.useSpecialLinesOnly) {
        this.playSeAudio("Accept/Cancel Quest");
        this.$store.commit("setUseBonusLines", !this.useBonusLines);
      }
    },
    toggleSpecialLines() {
      this.playSeAudio("Accept/Cancel Quest");
      this.$store.commit("setUseSpecialLines", !this.useSpecialLines);
    },
    toggleUseSpecialLinesOnly() {
      // Only allow change if special lines is active
      if (this.useSpecialLines) {
        this.playSeAudio("Accept/Cancel Quest");
        this.$store.commit("setUseSpecialLinesOnly", !this.useSpecialLinesOnly);
      }
    },
    playSeAudio(seName) {
      if (!seName || !this.seDB || !this.seDB[seName]) {
        return;
      }

      if (!this.audio[seName]) {
        this.audio[seName] = new Audio();
        this.audio[seName].volume = this.seVolume;
        this.audio[seName].src = this.seDB[seName];
        this.audio[seName].load();
      } else {
        this.audio[seName].pause();
        this.audio[seName].currentTime = 0;
      }
      this.audio[seName].play();
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
        width: 50px;
        justify-content: flex-end;
      }
    }

    .volume-icon {
      height: 100%;
      display: flex;
      align-items: center;
      margin-right: -5px;

      img {
        height: 20px;
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
      width: 100%;
      pointer-events: none;

      button {
        pointer-events: auto;
      }
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
    z-index: 100;

    overflow-y: auto;

    &.center {
      display: flex;
      justify-content: center;
    }

    &.composition {
      height: 85%;
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

  .highlight-button {
    animation-name: spin360;
    animation-duration: 8s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
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
      pointer-events: none;
      min-width: 90px;
    }

    &.min-mode {
      position: static;
      flex: 2;
      height: 100%;
      img {
        min-width: 0px;
        height: 100%;
      }
    }
  }

  .composition-button {
    position: absolute;
    bottom: 8px;
    left: 16px;

    img {
      pointer-events: none;
      min-width: 60px;
    }

    &.min-mode {
      position: static;
      flex: 1;
      height: 100%;
      img {
        min-width: 0px;
        height: 100%;
      }
    }
  }

  .repair-button {
    position: absolute;
    bottom: 8px;
    left: 16px;

    img {
      pointer-events: none;
      min-width: 60px;
    }

    &.min-mode {
      position: static;
      flex: 1;
      img {
        min-width: 0px;
        height: 100%;
      }
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

    &.min-mode {
      position: static;
      flex: 1;
      height: 100%;

      img {
        min-width: 0px;
        width: 100%;
        height: 100%;
      }
    }
  }

  .button-wrapper {
    &.min-mode {
      position: absolute;
      bottom: 2%;
      left: 2%;
      right: 2%;

      display: flex;
      align-items: flex-end;
      justify-content: center;
      max-height: 20%;

      .buttons-left {
        display: flex;
        width: 40%;
        align-items: flex-end;
      }

      .buttons-center {
        width: 50%;
      }

      .buttons-right {
        display: flex;
        align-items: flex-end;
        width: 10%;
      }
    }
  }
}
</style>