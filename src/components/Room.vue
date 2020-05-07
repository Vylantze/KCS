<template>
  <div class="room-container center-div">
    <div class="room fixed">
      <canvas id="room-canvas" :width="canvasWidth" :height="canvasHeight" />
      <div class="absolute foreground">
        <slot />
      </div>
    </div>
  </div>
</template>


<style lang="less" scoped>
.room-container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .room {
    height: 100%;

    .foreground {
      user-select: none;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<script>
//const path = require("path");

export default {
  name: "Room",
  data() {
    return {
      roomWall: null,
      roomWindow: null,
      roomObject: null,

      ctx: null, // Canvas context
      previousWindowInnerHeight: 0
    };
  },
  computed: {
    canvas() {
      return document.getElementById("room-canvas");
    },
    canvasHeight() {
      return `${window.innerHeight}px`;
    },
    canvasWidth() {
      return `${window.innerWidth}px`;
    }
  },
  async mounted() {
    this.ctx = this.canvas.getContext("2d");
    await this.loadBackground();
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeCanvas);
  },
  methods: {
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
    async loadBackground() {
      this.roomWall = await this.loadImage("backgrounds/room_background.png");
      this.roomWindow = await this.loadImage("backgrounds/room_window.png");
      this.roomObject = await this.loadImage("backgrounds/room_objects.png");
    },
    // To get the correct ratio
    calculateWidthFromHeight(height) {
      return (height * 800) / 480.0;
    },
    drawBackground() {
      let height = window.innerHeight;
      let width = this.calculateWidthFromHeight(height);
      this.ctx.drawImage(this.roomWall, 0, 0, width, height);
      this.ctx.drawImage(this.roomWindow, 0, 0, width, height);
      this.ctx.drawImage(this.roomObject, 0, 0, width, height);
    },
    resizeCanvas() {
      if (window.innerHeight == this.previousWindowInnerHeight) {
        return;
      }

      console.log(`Room resize: ${this.canvas.width}, ${this.canvas.height}`);
      try {
        // No need to clear because the background will always be 100% redrawn over
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.calculateWidthFromHeight(window.innerHeight);
        this.drawBackground();
        this.previousWindowInnerHeight = window.innerHeight;
      } catch (e) {
        console.warn("[Room] Error in resize. ", e);
      }
    }
  }
};
</script>