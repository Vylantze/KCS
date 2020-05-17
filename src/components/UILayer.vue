<template>
  <div class="ui-layer" :style="{ width: `${uiWidth}px` }">
    <div v-if="menuOpen" class="menu-closer" @click.self="closeMenu">
      <div />
      <div
        v-if="menuOpen == 'ship-selector'"
        class="menu center-div"
      >You only need {{ selectedShip }}.</div>
      <div v-if="menuOpen == 'settings'" class="menu center-div">
        <BGM />
      </div>
    </div>

    <div class="ship-selector-button clickable" @click="selectShip">
      <img src="img/ship_select.png" :width="shipSelectorWidth" />
    </div>
    <div class="settings-button clickable center-div" @click="openSettings">
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
import { mapGetters } from "vuex";

import BGM from "./BGM.vue";

export default {
  name: "UILayer",
  components: {
    BGM
  },
  props: {
    selectedShip: { type: String, default: "" },
    selectedSprite: { type: String, default: "" },
    selectedBgm: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
      shipSelectorWidth: null,
      subtitleMaxWidth: null,

      uiWidth: null,
      menuOpen: null
    };
  },
  computed: {
    ...mapGetters(["ships", "subtitle"])
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
    selectShip() {
      if (this.menuOpen != "ship-selector") {
        this.menuOpen = "ship-selector";
      } else {
        this.closeMenu();
      }
    },
    openSettings() {
      if (this.menuOpen != "settings") {
        this.menuOpen = "settings";
      } else {
        this.closeMenu();
      }
    },
    resizeUI() {
      try {
        this.uiWidth = this.calculateWidthFromHeight(
          __roomBackground.naturalWidth,
          __roomBackground.naturalHeight,
          window.innerHeight
        );
        let widthToUse = Math.min(this.uiWidth, window.innerWidth);
        this.subtitleMaxWidth = widthToUse < 500 ? null : "60%";
        this.shipSelectorWidth = widthToUse * 0.15;
        window.log("Submax", this.subtitleMaxWidth, this.uiWidth);
      } catch (e) {
        window.logError("[App] Error in resize. ", e);
      }
    },
    changeShip(ship) {
      this.$emit("update:selectedShip", ship);
    },
    changeSprite(sprite) {
      this.$emit("update:selectedSprite", sprite);
    }
  }
};
</script>

<style lang="less" scoped>
.ui-layer {
  position: relative;
  height: 100%;

  div {
    pointer-events: auto;
  }

  .menu-closer {
    position: relative;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

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
    margin: 10px auto;
    background-color: rgba(0, 0, 0, 0.7);
    width: 80%;
    height: 65%;
    color: white;

    overflow-y: auto;
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
    bottom: 8px;
    right: 16px;
    background-color: #20a0a3;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    padding-top: 2px;
    padding-right: 2px;

    img {
      width: 35px;
    }
  }
}
</style>