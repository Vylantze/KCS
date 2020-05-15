<template>
  <div class="ui-layer" :style="{ width: `${uiWidth}px` }">
    <div class="ship-selector-button clickable" @click="selectShip">
      <img src="img/ship_select.png" :width="shipSelectorWidth" />
    </div>
    <div class="subtitles-container center-div">
      <div
        v-show="Boolean(subtitle)"
        class="subtitles"
        :style="{ 'max-width': subtitleMaxWidth }"
      >{{ subtitle }}</div>
    </div>

    <div v-if="menuOpen == 'ship-selector'" class="ship-selector center-div">You only need Yamato.</div>
    <div v-if="menuOpen" class="menu-closer" @click="closeMenu" />
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "UILayer",
  props: {
    selectedShip: { type: String, default: "" },
    selectedSprite: { type: String, default: "" }
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
    ...mapState({
      ships: s => s.main.ships,
      subtitle: s => s.main.subtitle
    })
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
    resizeUI() {
      try {
        this.uiWidth = this.calculateWidthFromHeight(
          window.roomBackground.naturalWidth,
          window.roomBackground.naturalHeight,
          window.innerHeight
        );
        let widthToUse = Math.min(this.uiWidth, window.innerWidth);
        this.subtitleMaxWidth = widthToUse < 500 ? null : "60%";
        this.shipSelectorWidth = widthToUse * 0.15;
        console.log("Submax", this.subtitleMaxWidth, this.uiWidth);
      } catch (e) {
        console.warn("[App] Error in resize. ", e);
      }
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
    width: 100%;
    height: 100%;
  }

  .ship-selector {
    margin: 10px auto;
    background-color: rgba(0, 0, 0, 0.7);
    width: 80%;
    height: 65%;
    color: white;
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
}
</style>