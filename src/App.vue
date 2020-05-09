<template>
  <div class="app">
    <Room>
      <Ship v-if="shipSelected" :ship-name="shipSelected" ship-sprite="Summer" />
    </Room>
    <div class="ui-container center-div">
      <div class="ui-layer" :style="{ width: `${uiWidth}px` }">
        <div class="ship-selector-button clickable" @click="selectShip">
          <img src="img/ship_select.png" :width="shipSelectorWidth" />
        </div>

        <div
          v-if="menuOpen == 'ship-selector'"
          class="ship-selector center-div"
        >You only need Yamato.</div>
        <div v-if="menuOpen" class="menu-closer" @click="closeMenu" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Room from "./components/Room.vue";
import Ship from "./components/Ship.vue";

export default {
  name: "App",
  components: {
    Room,
    Ship
  },
  data() {
    return {
      shipSelected: "Yamato",
      sprite: null,
      shipSelectorWidth: null,

      uiWidth: null,
      menuOpen: null
    };
  },
  computed: {
    ...mapState({
      ships: s => s.main.ships
    })
  },
  created() {
    this.$store.dispatch("populateData");
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
        this.shipSelectorWidth = widthToUse * 0.15;
      } catch (e) {
        console.warn("[App] Error in resize. ", e);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.app {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  //color: #2c3e50;
  //margin-top: 60px;

  .ui-container {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1000;
  }

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
      background-color: rgba(0, 0, 0, 0.5);
      width: 80%;
      height: 65%;
      color: white;
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
}
</style>
