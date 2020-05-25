<template>
  <div class="ship">
    <canvas
      v-if="shipName"
      :id="`ship-${shipFileName}`"
      :width="canvasWidth"
      :height="canvasHeight"
    />
  </div>
</template>


<style lang="less" scoped>
.ship {
  width: 100%;
  height: 100%;
}
</style>

<script>
import { mapGetters } from "vuex";

const path = require("path");
const heightModifier = 1.3; // of total canvas height

export default {
  name: "Ship",
  data() {
    return {
      windowHeight: 0,

      // percentage based. Allows ship to 'hide' out of the window
      shipXOffsetModifier: 0,
      shipYOffsetModifier: 0,

      defaultSprite: null,
      damagedSprite: null,
      audio: new Audio(),

      damaged: false,
      currentEvent: null,

      idleTimeout: null,

      shipDB: null,
      ctx: null // Canvas context
    };
  },
  computed: {
    ...mapGetters({
      selectedShipName: "selectedShipName",
      shipSprite: "selectedSpriteName",
      voiceVolume: "voiceVolume",

      useSpecialLines: "useSpecialLines",
      useSpecialLinesOnly: "useSpecialLinesOnly",
      useBonusLines: "useBonusLines",

      idleLineWait: "idleLineWait",

      loading: "loadingMode"
    }),
    shipName() {
      return this.selectedShipName;
    },
    shipFileName() {
      if (!this.shipName || !this.shipDB) return null;
      return this.shipDB.FileName;
    },
    shipDir() {
      if (!this.shipName || !this.shipFileName) return null;
      return path.join(__ship, this.shipFileName);
    },
    spritesDir() {
      if (!this.shipName) return null;
      return path.join(this.shipDir, "sprites");
    },
    voicesDir() {
      if (!this.shipName) return null;
      return path.join(this.shipDir, "voices");
    },
    canvas() {
      return document.getElementById(`ship-${this.shipFileName}`);
    },
    canvasHeight() {
      return `${window.innerHeight}px`;
    },
    canvasWidth() {
      return `${window.innerWidth}px`;
    },

    shipHeight() {
      return this.windowHeight * heightModifier;
    },
    shipWidth() {
      let sprite = this.damaged ? this.damagedSprite : this.defaultSprite;
      if (!sprite) return 0;
      return this.calculateWidthFromHeight(
        sprite.naturalWidth,
        sprite.naturalHeight,
        this.shipHeight
      );
    },

    shipXPositionOffset() {
      return this.canvas.width * this.shipXOffsetModifier;
    },
    shipYPositionOffset() {
      return this.canvas.height * this.shipYOffsetModifier;
    },

    //
    // Command list
    //
    shipCommands() {
      if (!this.shipDB) return null;
      try {
        return this.shipDB.Commands;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipCommands.", e);
      }
      return {};
    },
    // SetSecretary
    shipSetSecretaryEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return this.shipDB.Commands.SetSecretary;
      } catch (e) {
        window.logError(
          "[Ship] Unexpected error in shipSetSecretaryEventNames.",
          e
        );
      }
      return [];
    },
    // Special
    shipSpecialEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return this.shipDB.Commands.Special.concat(
          this.shipDB.Commands.Wedding
        );
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipSpecialEventNames.", e);
      }
      return [];
    },
    // Idle
    shipIdleEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        let idleList = this.shipDB.Commands.Idle;
        if (this.useBonusLines) {
          idleList = idleList.concat(this.shipDB.Commands.IdleBonus);
        }
        return idleList;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipIdleEventNames.", e);
      }
      return [];
    },
    // Tap
    shipTapEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      if (this.useSpecialLinesOnly) {
        return this.shipSpecialEventNames;
      }

      try {
        let tapList = this.shipDB.Commands.Tap;
        if (this.useBonusLines) {
          tapList = tapList.concat(this.shipDB.Commands.TapBonus);
        }
        if (this.useSpecialLines) {
          tapList = tapList.concat(this.shipSpecialEventNames);
        }
        return tapList;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipTapEventNames.", e);
      }
      return [];
    },
    // Hourly
    shipHourlyEventNames() {
      if (!this.shipDB || !this.shipDB.Commands || !this.shipDB.Commands.Hourly)
        return [];
      try {
        return this.shipDB.Commands.Hourly;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipHourlyEventNames.", e);
      }
      return [];
    },

    // Get allowed model types
    shipSpriteModels() {
      if (!this.shipDB) return null;
      try {
        return this.shipDB.Sprites[this.shipSprite].Models;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipSpriteModels.", e);
      }
      return null;
    },

    // Get normal sprite
    shipNormalImagePath() {
      if (!this.shipDB) return null;
      try {
        return path.join(
          this.spritesDir,
          this.shipDB.Sprites[this.shipSprite].Normal
        );
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipNormalImagePath.", e);
      }
      return null;
    },
    // Get damaged sprite
    shipDamagedImagePath() {
      if (!this.shipDB) return null;
      try {
        return path.join(
          this.spritesDir,
          this.shipDB.Sprites[this.shipSprite].Damaged
        );
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipNormalImagePath.", e);
      }
      return null;
    }
  },
  watch: {
    shipName() {
      this.loadShip();
    },
    shipSprite() {
      this.loadShip();
    },
    voiceVolume() {
      this.audio.volume = this.voiceVolume;
    },
    loading(newData) {
      if (!this.audio) {
        return;
      }
      if (newData) {
        // If true
        this.audio.pause();
      } else {
        this.onAdd();
      }
    },
    idleLineWait() {
      this.resetIdleTimeout();
    }
  },
  async mounted() {
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", this.resizeCanvas);
    window.addEventListener("hourly", this.onHourly);
    this.canvas.addEventListener("click", this.clickOnShip);
    this.audio.onended = this.audioHasEnded;

    this.audio.volume = this.voiceVolume;
    await this.loadShip();
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeCanvas);
    window.removeEventListener("hourly", this.onHourly);
    if (this.idleTimeout) {
      window.clearTimeout(this.idleTimeout);
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
  },
  methods: {
    clickOnShip(event) {
      let canvasRect = this.canvas.getBoundingClientRect();
      const mousePos = {
        x: event.x - canvasRect.x,
        y: event.y - canvasRect.y
      };
      try {
        const pixel = this.canvas
          .getContext("2d")
          .getImageData(mousePos.x, mousePos.y, 1, 1).data;
        if (pixel[3] == 0) {
          return;
        }
      } catch (e) {
        window.logError("Unable to check click event. ", e);
        return;
      }

      // If success, allow
      this.onTap();
    },
    resetIdleTimeout() {
      if (this.idleTimeout) {
        window.clearTimeout(this.idleTimeout);
      }

      let now = new Date();
      log(
        `resetIdleTimeout wait ${
          this.idleLineWait
        } min from [${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`
      );

      this.idleTimeout = window.setTimeout(
        this.onIdle,
        this.idleLineWait * 60 * 1000
      );
    },
    audioHasEnded() {
      this.$store.commit("setTitle", null);
      this.$store.commit("setSubtitle", null);
      this.currentEvent = null;
    },
    playCurrentEvent() {
      if (this.audio) {
        this.audio.pause();
      }
      if (this.loading) return;

      window.log(
        `Playing voice [${this.currentEvent.Model}/${this.currentEvent.Event}].`,
        this.currentEvent
      );

      try {
        let currentVoice = path.join(this.voicesDir, this.currentEvent.Voice);
        this.audio.src = currentVoice;
        this.audio.load();

        let promise = this.audio.play();
        promise
          .then(() => {
            this.resetIdleTimeout();
            this.$store.commit("setSubtitle", this.currentEvent.English);
            if (
              this.currentEvent.Command == "Special" ||
              this.currentEvent.Command == "Wedding"
            ) {
              this.$store.commit("setTitle", this.currentEvent.Event);
            } else {
              this.$store.commit("setTitle", null);
            }
          })
          .catch(e => {
            throw e;
          });
      } catch (e) {
        logError("[Ship][playCurrentEvent] Error.", e);
      }
    },
    selectAndPlayEvent(eventType, eventNames) {
      if (!eventNames || eventNames.length == 0) {
        return;
      }
      try {
        let list = this.getEventDataFromEventNames(eventNames);
        if (!list || list.length == 0) return;
        this.currentEvent = list[Math.floor(Math.random() * list.length)];
        this.playCurrentEvent();
      } catch (e) {
        window.logError(`[Ship] Error for '${eventType}'.`, e);
      }
    },
    onIdle() {
      if (this.idleTimeout) {
        window.clearTimeout(this.idleTimeout);
      }

      if (this.audio) {
        if (!this.audio.paused && !this.audio.ended) {
          // Wait for the audio to finish playing

          this.idleTimeout = window.setTimeout(() => {
            // Wait another 3 seconds as padding.
            this.onIdle();
          }, 3000);
          return;
        }
      }

      this.selectAndPlayEvent("onIdle", this.shipIdleEventNames);
    },
    onAdd() {
      this.selectAndPlayEvent("onAdd", this.shipSetSecretaryEventNames);
    },
    onTap() {
      this.selectAndPlayEvent("onTap", this.shipTapEventNames);
    },
    onHourly(hourlyEvent) {
      if (this.audio) {
        if (!this.audio.paused && !this.audio.ended) {
          // Wait for the audio to finish playing
          window.setTimeout(() => {
            // Wait another 3 seconds as padding.
            this.onHourly(hourlyEvent);
          }, 3000);
          return;
        }
      }

      try {
        let list = this.getEventDataFromEventNames(this.shipHourlyEventNames);
        if (!list || list.length == 0) return;
        list.map(event => {
          if (event.Event == hourlyEvent.detail) {
            this.currentEvent = event;
          }
        });
        this.playCurrentEvent();
      } catch (e) {
        window.logError("[Ship] Error in 'onHourly'.", e);
      }
    },
    async getDatabase() {
      this.shipDB = await this.$store.dispatch("getDatabase", this.shipName);
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    getEventDataFromEventNames(eventList) {
      if (
        !this.shipDB ||
        !eventList ||
        eventList.length == 0 ||
        !this.shipSpriteModels
      )
        return [];
      let models = this.shipSpriteModels;
      let eventDataList = [];
      try {
        eventList.map(eventName => {
          let array = this.shipDB.Events[eventName];
          if (array.length == 1) {
            eventDataList.push(array[0]);
          } else {
            array.map(event => {
              if (models.includes(event.Model)) {
                eventDataList.push(event);
              }
            });
          }
        });
      } catch (e) {
        window.logError(
          "[Ship] Unexpected error in getVoiceFilesFromEventList.",
          eventList,
          e
        );
      }
      return eventDataList;
    },
    loadImage(imageName) {
      if (!imageName) return null;
      return new Promise(resolve => {
        let image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.src = imageName;
      });
    },
    async loadShip() {
      try {
        await this.getDatabase();
        this.defaultSprite = await this.loadImage(this.shipNormalImagePath);
        this.damagedSprite = await this.loadImage(this.shipDamagedImagePath);
        this.resizeCanvas();

        // Play SetSecretary event
        this.onAdd();
      } catch (e) {
        window.logError("[Ship] Error in getDatabase or loadShip", e);
      }
    },
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
    },
    drawShip() {
      let height = this.shipHeight;
      let width = this.shipWidth;

      if (!height || !width) return;

      // Some maths needed to decide Y position of ship
      let shipCenterY = height / 2.0;
      let canvasCenterY = this.canvas.height / 2.0;
      let yOffset =
        this.shipYPositionOffset + (shipCenterY - canvasCenterY) / 2.0;

      // Some maths need to be done to decide on the X position of the shipgirl
      let canvasCenterX = this.canvas.width / 2.0;
      let shipCenterX = width / 2.0; // Used to set the ship in the center of the expected point
      let shipExpectedPosition =
        Math.min(this.canvas.width, window.innerWidth) * 0.8;
      let shipActualPosition = Math.max(canvasCenterX, shipExpectedPosition);
      let xOffset = this.shipXPositionOffset + shipActualPosition - shipCenterX;

      this.ctx.drawImage(this.defaultSprite, xOffset, yOffset, width, height);
    },
    resizeCanvas() {
      //window.log(`Ship Resize: ${this.canvas.width}, ${this.canvas.height}`);
      try {
        this.windowHeight = window.innerHeight;
        this.clearCanvas();
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.calculateWidthFromHeight(
          __room.naturalWidth,
          __room.naturalHeight,
          window.innerHeight
        );
        this.drawShip();
      } catch (e) {
        window.logError("[Ship] Error in resize. ", e);
      }
    }
  }
};
</script>