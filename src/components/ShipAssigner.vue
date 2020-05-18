<template>
  <div class="ship-assigner">
    <!-- 
      Header
    -->
    <div class="header">
      <div class="left">
        <button class="standard-button info">Prev</button>
      </div>
      <div class="center-div">
        <img
          v-if="windowWidth > mobileWidth"
          :src="getSprite(currentShipDefaultBanner)"
          class="banner"
        />
      </div>
      <div class="right">
        <button class="standard-button info">Next</button>
      </div>
    </div>

    <!-- 
      Main content
    -->

    <div v-for="(row, rowIndex) in splitArray" :key="rowIndex">
      <div class="d-flex">
        <div
          v-for="(shipSpriteName, index) in row"
          :key="`${rowIndex}-${index}`"
          class="card-holder"
          :class="{ ml: index != 0 }"
        >
          <div v-if="Boolean(currentShipSprites[shipSpriteName])" class="center-div">
            <div>
              <img
                class="card"
                :src="getSprite(currentShipSprites[shipSpriteName].Card)"
                :width="shipCardWidth"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import path from "path";

export default {
  name: "ShipAssigner",
  data() {
    return {
      windowWidth: 0,
      numberOfShipsInRow: 1,
      currentShip: null,
      splitArray: []
    };
  },
  computed: {
    ...mapGetters({
      database: "database",
      shipNames: "shipNames",
      selectedShipName: "selectedShipName",
      selectedSpriteName: "selectedSpriteName"
    }),
    shipSprites() {
      if (!this.shipNames || !this.database) return [];
      return this.shipNames.map(shipName => this.database[shipName].Sprites); //.reduce((t, s) => t.concat(s))
    },
    mobileWidth() {
      return window.__mobileMode.width;
    },
    shipCardWidth() {
      return this.mobileWidth > this.windowWidth ? 200 : this.windowWidth / 4.5;
    },

    shipFileName() {
      if (!this.currentShip) return null;
      let name = this.currentShip.replace(/ /g, "_").toLowerCase();
      return name;
    },
    shipDir() {
      if (!this.currentShip) return null;
      return path.join(__ship, this.shipFileName);
    },
    spritesDir() {
      if (!this.currentShip) return null;
      return path.join(this.shipDir, "sprites");
    },

    currentShipNameIndex() {
      if (!this.currentShip) return 0;
      return this.shipNames.indexOf(this.currentShip);
    },
    currentShipSprites() {
      if (
        !this.database ||
        !this.currentShip ||
        !this.database[this.currentShip]
      ) {
        return [];
      }
      return this.database[this.currentShip].Sprites;
    },
    currentShipSpritesKeys() {
      if (!this.currentShipSprites || this.currentShipSprites.length == 0) {
        return [];
      }
      return Object.keys(this.currentShipSprites).filter(s =>
        Boolean(this.currentShipSprites[s].Card)
      );
    },
    currentShipDefaultSprites() {
      if (!this.currentShipSprites) {
        return null;
      }
      return this.currentShipSprites[this.currentShip];
    },
    currentShipDefaultBanner() {
      if (!this.currentShipDefaultSprites) {
        return null;
      }
      return this.currentShipDefaultSprites.Banner;
    }
  },
  async mounted() {
    this.changeCurrentShip(this.selectedShipName);
    this.recalculateWidth();
    window.addEventListener("resize", this.recalculateWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.recalculateWidth);
  },
  methods: {
    // To get the correct ratio
    calculateWidthFromHeight(height) {
      return (
        (height * __roomBackground.naturalWidth) /
        (__roomBackground.naturalHeight * 1.0)
      );
    },
    recalculateWidth() {
      this.windowWidth = Math.min(
        window.innerWidth,
        this.calculateWidthFromHeight(window.innerHeight)
      );
      this.numberOfShipsInRow = this.windowWidth < this.mobileWidth ? 1 : 3;
      this.generateSplitArray(this.currentShipSpritesKeys);
    },
    changeShip(ship) {
      this.$store.commit("setSelectedShipName", ship);
    },
    changeSprite(sprite) {
      this.$store.commit("setSelectedSpriteName", sprite);
    },
    getSprite(filename) {
      if (!filename) {
        return null;
      }
      return path.join(this.spritesDir, filename);
    },
    changeCurrentShip(ship) {
      this.currentShip = ship;
      this.generateSplitArray(this.currentShipSpritesKeys);
    },
    generateSplitArray(spritesArray) {
      if (!spritesArray || spritesArray.length == 0) {
        return;
      }
      try {
        let generatedArray = [];
        let spriteList = JSON.parse(JSON.stringify(spritesArray));
        for (
          let i = 0;
          i < spriteList.length;
          i = i + this.numberOfShipsInRow
        ) {
          let array = [];
          for (let j = 0; j < this.numberOfShipsInRow; j++) {
            array.push(spriteList[i + j]);
          }
          generatedArray.push(array);
        }
        this.splitArray = generatedArray;
      } catch (e) {
        logError("[ShipAssigner] generateSplitArray error.", e);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.ship-assigner {
  width: 100%;
  height: 100%;
  padding: 0px 20px;

  .header {
    display: flex;
    margin-bottom: 20px;

    .left {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-right: 10px;
      flex: 1;
    }

    .right {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 10px;
      flex: 1;
    }
  }

  .card-holder {
    flex: 1;
    margin-bottom: 20px;
  }

  .banner {
    width: 150px;
  }
}
</style>