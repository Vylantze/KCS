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
import { mapGetters } from "vuex";

export default {
  name: "Room",
  data() {
    return {
      roomWall: null,
      roomWindow: null,
      roomObject: null,

      bgmAudio: new Audio(),

      ctx: null, // Canvas context
      previousWindowInnerHeight: 0
    };
  },
  computed: {
    ...mapGetters({
      BGMs: "BGMs",
      selectedBgm: "selectedBgm",
      bgmVolume: "bgmVolume",
      shipName: "selectedShipName"
    }),
    canvas() {
      return document.getElementById("room-canvas");
    },
    canvasHeight() {
      return `${window.innerHeight}px`;
    },
    canvasWidth() {
      return `${window.innerWidth}px`;
    },
    mainMenuBGM() {
      return this.BGMs ? this.BGMs["Main Menu"] : null;
    }
  },
  watch: {
    selectedBgm(newBgm, oldBgm) {
      log("SelectedBgm change", oldBgm, newBgm);
      if (this.bgmAudio && this.selectedBgm) {
        this.playBgmAudio();
      }
    },
    bgmVolume() {
      this.bgmAudio.volume = this.bgmVolume;
    },
    shipName() {
      this.drawBackground();
    }
  },
  async mounted() {
    this.ctx = this.canvas.getContext("2d");
    await this.loadBackground();
    this.resizeCanvas();

    if (!this.selectedBgm) {
      this.$store.commit("setSelectedBgm", this.mainMenuBGM);
    }
    this.bgmAudio.volume = this.bgmVolume;
    this.bgmAudio.loop = true;
    this.playBgmAudio(); // Let the watcher activate it for us

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
      this.roomDesk = await this.loadImage("backgrounds/Mahogany_desk.png");
      this.roomWallObject = await this.loadImage(
        "backgrounds/Old_world_map.png"
      );
      this.roomWallObjectAkizuki = this.roomObjects = await this.loadImage(
        "backgrounds/Spring_Type_B_sisters_panel.png"
      );
    },
    // To get the correct ratio
    calculateWidthFromHeight(height) {
      return (height * __room.naturalWidth) / (__room.naturalHeight * 1.0);
    },
    drawBackground() {
      let height = window.innerHeight;
      let width = this.calculateWidthFromHeight(height);
      this.ctx.drawImage(this.roomWall, 0, 0, width, height);
      this.ctx.drawImage(this.roomWindow, 0, 0, width, height);

      // Draw wall object
      let objectToDraw = this.getWallObjectToDraw();
      this.ctx.drawImage(
        objectToDraw,
        0,
        0,
        (__room.wallObject.width / __room.naturalWidth) * width,
        (__room.wallObject.height / __room.naturalHeight) * height
      );

      // Draw desk
      let deskWidth = (__room.desk.width / __room.naturalWidth) * width;
      let deskHeight = (__room.desk.height / __room.naturalHeight) * height;

      this.ctx.drawImage(
        this.roomDesk,
        0,
        height - deskHeight,
        deskWidth,
        deskHeight
      );
    },
    getWallObjectToDraw() {
      return this.shipName == "Akizuki" ||
        this.shipName == "Teruzuki" ||
        this.shipName == "Hatsuzuki" ||
        this.shipName == "Suzutsuki"
        ? this.roomWallObjectAkizuki
        : this.roomWallObject;
    },
    playBgmAudio() {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }

      if (!this.selectedBgm) {
        return;
      }

      window.log(
        `Playing BGM [${this.selectedBgm.English}].`,
        this.selectedBgm
      );
      let currentFile = this.selectedBgm.File;
      this.bgmAudio.src = currentFile;
      this.bgmAudio.load();
      this.bgmAudio.play();
    },
    resizeCanvas() {
      if (window.innerHeight == this.previousWindowInnerHeight) {
        return;
      }

      //window.log(`Room resize: ${this.canvas.width}, ${this.canvas.height}`);
      try {
        // No need to clear because the background will always be 100% redrawn over
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.calculateWidthFromHeight(window.innerHeight);
        this.drawBackground();
        this.previousWindowInnerHeight = window.innerHeight;
      } catch (e) {
        window.logError("[Room] Error in resize. ", e);
      }
    }
  }
};
</script>