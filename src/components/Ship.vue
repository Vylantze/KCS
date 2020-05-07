<template>
  <div class="ship">
    <canvas v-if="shipName" :id="`ship-${shipName}`" :width="canvasWidth" :height="canvasHeight" />
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
const marginRightModifier = 0.2; // 0.1 of total canvas width
const roomBackground = {
  naturalWidth: 800,
  naturalHeight: 480
};

export default {
  name: "Ship",
  props: {
    shipName: { type: String, default: "" },
    shipSeason: { type: String, default: "" },
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

      ctx: null // Canvas context
    };
  },
  computed: {
    canvas() {
      return document.getElementById(`ship-${this.shipName}`);
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
      if (this.shipSeason) {
        imageName += `_${this.shipSeason}`;
      }
      return `ship/${this.shipName}/sprites/${imageName}_Full.png`;
    },
    shipDamagedImageName() {
      let imageName = this.shipName;
      if (this.shipSeason) {
        imageName += `_${this.shipSeason}`;
      }
      return `ship/${this.shipName}/sprites/${imageName}_Full_Damaged.png`;
    }
  },
  async mounted() {
    this.ctx = this.canvas.getContext("2d");
    await this.loadShip();
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
    this.canvas.addEventListener("click", this.clickOnShip);
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
      let shipCenterX = width / 2.0;
      let maxWidth = Math.min(window.innerWidth, this.canvas.width);
      let halfMaxWidth = maxWidth / 2.0;
      let leftPadding = halfMaxWidth - shipCenterX;
      let rightPadding = leftPadding * marginRightModifier;

      let xOffset =
        this.shipXPositionOffset +
        canvasCenterX -
        shipCenterX +
        leftPadding -
        rightPadding;

      this.ctx.drawImage(this.defaultSprite, xOffset, yOffset, width, height);

      /*
      console.log("Ship data", {
        canvasWidth: this.canvas.width,
        windowWidth: window.innerWidth,
        maxWidthUsed: maxWidth,
        subtracted: this.canvas.width - width,
        rightPadding
      });
      //*/
    },
    resizeCanvas() {
      //console.log(`Ship Resize: ${this.canvas.width}, ${this.canvas.height}`);
      try {
        this.windowHeight = window.innerHeight;
        this.clearCanvas();
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.calculateWidthFromHeight(
          roomBackground.naturalWidth,
          roomBackground.naturalHeight,
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