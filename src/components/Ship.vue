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

      database: null,
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

    shipDefaultImageName() {
      let imageName = this.shipName;
      if (this.shipSprite) {
        imageName += `_${this.shipSprite}`;
      }
      return `ship/${this.shipName.toLowerCase()}/sprites/${imageName}_Full.png`;
    },
    shipDamagedImageName() {
      let imageName = this.shipName;
      if (this.shipSprite) {
        imageName += `_${this.shipSprite}`;
      }
      return `ship/${this.shipName.toLowerCase()}/sprites/${imageName}_Full_Damaged.png`;
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
  mounted() {
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", this.resizeCanvas);
    this.canvas.addEventListener("click", this.clickOnShip);
    this.loadShip();
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeCanvas);
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
      console.log("Click");
    },
    getDatabase() {
      this.database = this.$store.dispatch("getDatabase", this.shipName);
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    loadImage(imageName) {
      return new Promise(resolve => {
        let image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.src = imageName;
      });
    },
    async loadShip() {
      this.defaultSprite = await this.loadImage(this.shipDefaultImageName);
      this.damagedSprite = await this.loadImage(this.shipDamagedImageName);
      this.getDatabase();
      this.resizeCanvas();
    },
    // To get the correct ratio
    calculateWidthFromHeight(naturalWidth, naturalHeight, currentHeight) {
      return (currentHeight * naturalWidth) / (naturalHeight * 1.0);
    },
    drawShip() {
      let height = this.shipHeight;
      let width = this.shipWidth;

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