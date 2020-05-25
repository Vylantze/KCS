<template>
  <div class="ship-assigner">
    <!-- 
      Header
    -->
    <div class="header">
      <div class="left">
        <button class="standard-button info" @click="prevship">Prev</button>
      </div>
      <div class="center-div fixed">
        <!--v-if="windowWidth > mobileWidth"-->
        <img :src="getSprite(currentShipDefaultBanner)" class="banner" />
        <div class="header-text absolute center-div">
          <!--<h3>{{ currentShip }}</h3>-->
        </div>
      </div>
      <div class="right">
        <button class="standard-button info" @click="nextship">Next</button>
      </div>
    </div>

    <!-- 
      Main content
    -->

    <div class="overflow-container">
      <div ref="shipAssignerMainContent" class="main-content">
        <div v-for="(row, rowIndex) in splitArray" :key="rowIndex">
          <div class="d-flex card-row" :class="{ last: rowIndex == splitArray.length - 1 }">
            <div
              v-for="(shipSpriteName, index) in row"
              :key="`${rowIndex}-${index}`"
              class="card-holder"
              :class="{ ml: index != 0 }"
            >
              <div v-if="Boolean(currentShipSprites[shipSpriteName])" class="center-div">
                <div
                  class="card"
                  :class="{ selected: shipSpriteName == selectedSpriteName }"
                  @click="changeShipAndSprite(shipSpriteName)"
                >
                  <img
                    :src="getSprite(currentShipSprites[shipSpriteName].Card)"
                    :width="shipCardWidth"
                    @load="scrollToSelectedElement"
                  />
                </div>
              </div>
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
    mainContent() {
      return this.$refs.shipAssignerMainContent;
    },
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

    currentShipDB() {
      if (
        !this.database ||
        !this.currentShip ||
        !this.database[this.currentShip]
      ) {
        return null;
      }
      return this.database[this.currentShip];
    },
    shipFileName() {
      if (!this.currentShip || !this.currentShipDB) return null;
      return this.currentShipDB.FileName;
    },
    shipDir() {
      if (!this.shipFileName) return null;
      return path.join(__ship, this.shipFileName);
    },
    spritesDir() {
      if (!this.shipDir) return null;
      return path.join(this.shipDir, "sprites");
    },
    currentShipNameIndex() {
      if (!this.currentShip) return 0;
      return this.shipNames.indexOf(this.currentShip);
    },
    currentShipSprites() {
      if (!this.currentShipDB) {
        return null;
      }
      return this.currentShipDB.Sprites;
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
      if (!this.currentShipDB) {
        return null;
      }
      let defaultBanner = this.currentShipDB.DefaultBanner;
      log("DefaultBanner", defaultBanner);
      if (!defaultBanner) {
        return null;
      }

      log("DefaultBannerSprites", this.currentShipDB.Sprites[defaultBanner]);
      return this.currentShipDB.Sprites[defaultBanner].Banner;
    }
  },
  created() {
    this.changeCurrentShip(this.selectedShipName);
    this.recalculateWidth();

    log("ShipDB", this.currentShipDB);
    log("ShipFileName", this.currentShipDB.FileName);
    window.addEventListener("resize", this.recalculateWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.recalculateWidth);
  },
  methods: {
    // To get the correct ratio
    calculateWidthFromHeight(height) {
      return (height * __room.naturalWidth) / (__room.naturalHeight * 1.0);
    },
    recalculateWidth() {
      this.windowWidth = Math.min(
        window.innerWidth,
        this.calculateWidthFromHeight(window.innerHeight)
      );
      this.numberOfShipsInRow = this.windowWidth < this.mobileWidth ? 1 : 3;
      this.generateSplitArray(this.currentShipSpritesKeys);
    },
    scrollToSelectedElement() {
      try {
        var elem = document.getElementsByClassName("card selected");
        if (!elem || elem.length == 0) {
          return;
        }
        elem[0].scrollIntoView();
      } catch (e) {
        logError(
          "[ShipAssigner] Unable to scroll to selected ship sprite's element.",
          e
        );
      }
    },
    changeShipAndSprite(sprite) {
      this.$store.commit("setSelectedShipName", this.currentShip);
      this.$store.commit("setSelectedSpriteName", sprite);
      this.$emit("shipChanged");
    },
    getSprite(filename) {
      if (!filename || !this.spritesDir) {
        return null;
      }
      return path.join(this.spritesDir, filename);
    },
    changeCurrentShip(ship) {
      this.currentShip = ship;
      this.generateSplitArray(this.currentShipSpritesKeys);
    },
    scrollMainContentToTop() {
      try {
        this.mainContent.scrollTop = 0;
      } catch (e) {
        logError("[ShipAssigner] Unable to scroll main content. ", e);
      }
    },
    prevship() {
      if (!this.shipNames || this.shipNames.length <= 1) {
        return;
      }
      this.$emit("buttonPress");
      let index = this.currentShipNameIndex;
      if (index == 0) {
        this.changeCurrentShip(this.shipNames[this.shipNames.length - 1]);
      } else {
        this.changeCurrentShip(this.shipNames[index - 1]);
      }
      this.scrollMainContentToTop();
    },
    nextship() {
      if (!this.shipNames || this.shipNames.length <= 1) {
        return;
      }
      this.$emit("buttonPress");
      let index = this.currentShipNameIndex;
      if (index == this.shipNames.length - 1) {
        this.changeCurrentShip(this.shipNames[0]);
      } else {
        this.changeCurrentShip(this.shipNames[index + 1]);
      }
      this.scrollMainContentToTop();
    },
    generateSplitArray(spritesArray) {
      if (
        !this.shipSprites ||
        !this.currentShip ||
        !spritesArray ||
        spritesArray.length == 0
      ) {
        return;
      }
      //let priorityList = ["Base", "Kai", "Kai Ni"];
      let spriteDB = this.shipSprites[this.currentShipNameIndex];

      if (!spriteDB) {
        return;
      }

      try {
        let generatedArray = [];
        let spriteList = JSON.parse(JSON.stringify(spritesArray)).sort(
          (a, b) => spriteDB[a].Index - spriteDB[b].Index
        );

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
@text-shadow-pos-width: 1px;
@text-shadow-neg-width: 1px;
@text-shadow-color: #000000;

.ship-assigner {
  width: 100%;
  height: 100%;
  padding: 0px 0px 0px 0px;

  .header {
    display: flex;
    margin-top: 10px;
    margin-bottom: 10px;

    .header-text {
      text-shadow: @text-shadow-pos-width @text-shadow-pos-width
          @text-shadow-color,
        @text-shadow-neg-width @text-shadow-neg-width @text-shadow-color,
        @text-shadow-neg-width @text-shadow-pos-width @text-shadow-color,
        @text-shadow-pos-width @text-shadow-neg-width @text-shadow-color;
    }

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

  .overflow-container {
    overflow: hidden;
    height: calc(100% - 60px);

    .main-content {
      overflow-y: auto;
      height: 100%;
    }
  }

  .card-row {
    margin-bottom: 20px;
    &.last {
      margin-bottom: 0px;
    }
  }

  .card-holder {
    flex: 1;

    .card {
      height: 100%;
      img {
        margin: 4px;
      }

      &.selected {
        img {
          margin: 0px;
          border: 4px solid blue;
        }
      }

      &:hover {
        img {
          margin: 0px;
          border: 4px solid yellow;
        }
      }
    }
  }

  .banner {
    width: 150px;
  }
}
</style>