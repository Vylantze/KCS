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
const heightModifier = 1.3; // of total canvas height

export default {
  name: "Ship",
  props: {
    shipName: { type: String, default: "" },
    shipSprite: { type: String, default: "" },
    damaged: { type: Boolean, default: false }
  },
  data() {
    return {
      windowHeight: 0,

      // percentage based. Allows ship to 'hide' out of the window
      shipXOffsetModifier: 0,
      shipYOffsetModifier: 0,

      defaultSprite: null,
      damagedSprite: null,
      audio: new Audio(),
      audioVolume: 1.0,

      currentEvent: null,

      shipDB: null,
      ctx: null // Canvas context
    };
  },
  computed: {
    shipFileName() {
      return this.shipName.replace(/ /g, "_").toLowerCase();
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
        console.warn("[Ship] Unexpected error in shipCommands.", e);
      }
      return {};
    },
    // SetSecretary
    shipSetSecretaryEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return this.shipDB.Commands.SetSecretary;
      } catch (e) {
        console.warn(
          "[Ship] Unexpected error in shipSetSecretaryEventNames.",
          e
        );
      }
      return [];
    },
    // Idle
    shipIdleEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return this.shipDB.Commands.Idle.concat(this.shipDB.Commands.IdleBonus);
      } catch (e) {
        console.warn("[Ship] Unexpected error in shipIdleEventNames.", e);
      }
      return [];
    },
    // Tap
    shipTapEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return this.shipDB.Commands.Tap.concat(this.shipDB.Commands.TapBonus);
      } catch (e) {
        console.warn("[Ship] Unexpected error in shipTapEventNames.", e);
      }
      return [];
    },
    // Hourly
    shipHourlyEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return this.shipDB.Commands.Hourly;
      } catch (e) {
        console.warn("[Ship] Unexpected error in shipHourlyEventNames.", e);
      }
      return [];
    },

    // Get normal sprite
    shipNormalImagePath() {
      if (!this.shipDB) return null;
      try {
        return this.shipDB.Sprites[this.shipSprite].Normal;
      } catch (e) {
        console.warn("[Ship] Unexpected error in shipNormalImagePath.", e);
      }
      return null;
    },
    // Get damaged sprite
    shipDamagedImagePath() {
      if (!this.shipDB) return null;
      try {
        return this.shipDB.Sprites[this.shipSprite].Damaged;
      } catch (e) {
        console.warn("[Ship] Unexpected error in shipNormalImagePath.", e);
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
    }
  },
  async mounted() {
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", this.resizeCanvas);
    window.addEventListener("hourly", this.onHourly);
    this.canvas.addEventListener("click", this.clickOnShip);
    this.audio.onended = this.audioHasEnded;

    this.audio.volume = this.audioVolume;
    try {
      await this.getDatabase();
      await this.loadShip();
    } catch (e) {
      console.warn("[Ship] Error in getDatabase or loadShip", e);
    }
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeCanvas);
    window.removeEventListener("hourly", this.onHourly);
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
        console.warn("Unable to check click event. ", e);
        return;
      }

      // If success, allow
      this.onTap();
    },
    audioHasEnded() {
      this.currentEvent = null;
      this.$store.commit("setSubtitle", null);
    },
    playCurrentEvent() {
      if (this.audio) {
        this.audio.pause();
      }

      console.log(`Playing [${this.currentEvent.Event}].`, this.currentEvent);
      let currentVoice = this.currentEvent.Voice;
      this.$store.commit("setSubtitle", this.currentEvent.English);
      this.audio.src = currentVoice;
      this.audio.load();
      this.audio.play();
    },
    onAdd() {
      if (this.shipTapEventNames.length == 0) {
        return;
      }
      try {
        let list = this.getEventDataFromEventNames(
          this.shipSetSecretaryEventNames
        );
        this.currentEvent = list[Math.floor(Math.random() * list.length)];
        this.playCurrentEvent();
      } catch (e) {
        console.warn("[Ship] Error in 'onAdd'.", e);
      }
    },
    onTap() {
      if (this.shipTapEventNames.length == 0) {
        return;
      }
      try {
        let list = this.getEventDataFromEventNames(this.shipTapEventNames);
        this.currentEvent = list[Math.floor(Math.random() * list.length)];
        this.playCurrentEvent();
      } catch (e) {
        console.warn("[Ship] Error in 'onTap'.", e);
      }
    },
    onHourly(hourlyEvent) {
      if (this.audio) {
        if (!this.audio.paused && !this.audio.ended) {
          // Wait for the audio to finish playing
          window.setTimeout(() => {
            // Wait another 3 seconds as padding.
            window.setTimeout(() => {
              this.onHourly(hourlyEvent);
            });
          }, 3000);
          return;
        }
      }

      try {
        let list = this.getEventDataFromEventNames(this.shipHourlyEventNames);
        list.map(event => {
          if (event.Event == hourlyEvent.detail) {
            this.currentEvent = event;
          }
        });
        this.playCurrentEvent();
      } catch (e) {
        console.warn("[Ship] Error in 'onHourly'.", e);
      }
    },
    async getDatabase() {
      this.shipDB = await this.$store.dispatch("getDatabase", this.shipName);
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    getEventDataFromEventNames(eventList) {
      if (!this.shipDB || !eventList || eventList.length == 0) return [];
      try {
        return eventList.map(event => {
          return this.shipDB.Events[event];
        });
      } catch (e) {
        console.warn(
          "[Ship] Unexpected error in getVoiceFilesFromEventList.",
          eventList,
          e
        );
      }
      return [];
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
      this.defaultSprite = await this.loadImage(this.shipNormalImagePath);
      this.damagedSprite = await this.loadImage(this.shipDamagedImagePath);
      this.resizeCanvas();

      // Play SetSecretary event
      this.onAdd();
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
      //console.log(`Ship Resize: ${this.canvas.width}, ${this.canvas.height}`);
      try {
        this.windowHeight = window.innerHeight;
        this.clearCanvas();
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.calculateWidthFromHeight(
          window.roomBackground.naturalWidth,
          window.roomBackground.naturalHeight,
          window.innerHeight
        );
        this.drawShip();
      } catch (e) {
        console.warn("[Ship] Error in resize. ", e);
      }
    }
  }
};
</script>