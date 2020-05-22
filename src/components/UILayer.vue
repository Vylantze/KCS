<template>
  <div class="ui-layer" :style="{ width: `${uiWidth}px` }">
    <div v-if="menuOpen" class="menu-closer">
      <div v-if="menuOpen == 'settings'" class="menu center limit-size">
        <div class="settings" style="margin-top: 20px;">
          <div class="d-flex">
            <button class="standard-button info" @click="openMenu('bgm')">Change BGM</button>
            <button
              class="standard-button"
              :class="{ 'info': hideButtons, 'danger': !hideButtons }"
              style="margin-left: 5px"
              @click="toggleHideButtons()"
            >
              <div style="width: 60px">{{ hideButtons ? "Show" : "Hide" }} Buttons</div>
            </button>
          </div>

          <h3>Volume</h3>
          <div class="slider-setting" style="margin-bottom: 5px;">
            <div class="label">Overall</div>
            <div class="slider-holder center-div">
              <input type="range" min="0" max="100" v-model="overallSlider" class="slider" />
            </div>
            <div class="label right">{{ Math.floor(overallVolume * 100) }}%</div>
          </div>
          <div class="slider-setting" style="margin-bottom: 5px;">
            <div class="label">BGM</div>
            <div class="slider-holder center-div">
              <input type="range" min="0" max="100" v-model="bgmSlider" class="slider" />
            </div>
            <div class="label right">{{ Math.floor(bgmVolume * 100) }}%</div>
          </div>
          <div class="slider-setting">
            <div class="label">Voice</div>
            <div class="slider-holder center-div">
              <input type="range" min="0" max="100" v-model="voiceSlider" class="slider" />
            </div>
            <div class="label right">{{ Math.floor(voiceVolume * 100) }}%</div>
          </div>
        </div>
      </div>

      <div v-if="menuOpen == 'ship-selector'" class="menu center-div">
        <ShipAssigner @closeMenu="closeMenu()" />
      </div>

      <div v-if="menuOpen == 'bgm'" class="menu center-div">
        <BGM />
      </div>

      <div class="back-button-holder center-div">
        <button
          v-if="menuOpen == 'bgm'"
          class="standard-button info"
          @click="openMenu('settings')"
        >Back</button>
        <button
          v-else-if="Boolean(menuOpen)"
          class="standard-button info"
          @click="closeMenu()"
        >Close</button>
      </div>
    </div>

    <div class="ship-selector-button clickable" @click="openMenu('ship-selector')">
      <img
        src="img/ship_select.png"
        :width="shipSelectorWidth"
        :class="{ 'set-transparent': hideButtons }"
      />
    </div>
    <div
      class="settings-button clickable center-div"
      :class="{ 'set-transparent': hideButtons }"
      @click="openMenu('settings')"
    >
      <img src="img/settings.png" />
    </div>
    <div class="subtitles-container center-div">
      <div
        v-show="Boolean(subtitle)"
        class="subtitles"
        :style="{ 'max-width': subtitleMaxWidth }"
      >{{ subtitle }}</div>
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
      shipSelectorWidth: null,
      subtitleMaxWidth: null,

      uiWidth: null,
      menuOpen: null,
      hideButtons: false
    };
  },
  computed: {
    ...mapGetters({
      subtitle: "subtitle"
    }),
    ...mapState({
      overallVolume: s => s.main.overallVolume,
      bgmVolume: s => s.main.bgmVolume,
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
    voiceSlider: {
      get() {
        return this.voiceVolume * 100;
      },
      set(value) {
        this.$store.commit("setVoiceVolume", value / 100.0);
      }
    }
  },
  async mounted() {
    this.resizeUI();
    window.addEventListener("resize", this.resizeUI);
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
    closeMenu() {
      this.menuOpen = null;
    },
    openMenu(name) {
      if (this.menuOpen != name) {
        this.menuOpen = name;
      } else {
        this.closeMenu();
      }
    },
    toggleHideButtons() {
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
        this.shipSelectorWidth = widthToUse * 0.15;
      } catch (e) {
        window.logError("[App] Error in resize. ", e);
      }
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

    .label {
      width: 60px;

      &.right {
        width: 45px;
        text-align: right;
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

  .ship-selector-button {
    position: absolute;
    bottom: 8px;
    left: 16px;

    img {
      min-width: 80px;
    }
  }

  .settings-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: #20a0a3;
    border-radius: 50%;
    height: 40px;
    width: 40px;

    img {
      width: 35px;
    }
  }
}
</style>