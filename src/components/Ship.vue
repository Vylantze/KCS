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
const shipDefaultExpectedPositionRatio = 0.8;
const shipCombatExpectedPositionRatio = 0.3;
const reqAnimFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.oRequestAnimationFrame;

export default {
  name: "Ship",
  data() {
    return {
      windowHeight: 0,
      canvasCalculatedWidth: 0,

      // % based. Allows ship to 'hide' out of the window
      shipXPositionModifier: 0,
      shipYPositionModifier: 0,
      shipExpectedPositionRatio: shipDefaultExpectedPositionRatio,

      defaultSprite: null,
      damagedSprite: null,
      audio: new Audio(),

      damaged: false,
      currentEvent: null,

      idleTimeout: null,
      shipMovementSpeed: 5,

      isShipAnimationFinished: true,

      loadCounter: 0,
      loadLimit: 2,

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
      useAllModelLines: "useAllModelLines",
      useIdleLines: "useIdleLines",

      idleLineWait: "idleLineWait",

      loading: "loadingMode",
      combatMode: "combatMode",
      damagedMode: "damagedMode"
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
      let sprite = this.damagedMode ? this.damagedSprite : this.defaultSprite;
      if (!sprite) return 0;
      return this.calculateWidthFromHeight(
        sprite.naturalWidth,
        sprite.naturalHeight,
        this.shipHeight
      );
    },

    shipXPositionOffset() {
      return (
        this.shipXPositionModifier *
        Math.min(this.canvasCalculatedWidth, window.innerWidth)
      );
    },
    shipYPositionOffset() {
      return this.shipYPositionModifier * this.windowHeight;
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
      return null;
    },
    // SetSecretary
    shipSetSecretaryEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        // If in combat mode (takes priority)
        if (this.combatMode) {
          return this.shipBattleStartEventNames;
        }

        return Array.isArray(this.shipDB.Commands.SetSecretary)
          ? this.shipDB.Commands.SetSecretary
          : [];
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
      if (!this.shipDB || !this.shipDB.Commands || this.combatMode) return [];
      try {
        let specialList = Array.isArray(this.shipDB.Commands.Special)
          ? this.shipDB.Commands.Special
          : [];
        if (Array.isArray(this.shipDB.Commands.Wedding)) {
          specialList = specialList.concat(this.shipDB.Commands.Wedding);
        }
        return specialList;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipSpecialEventNames.", e);
      }
      return [];
    },
    // Idle
    shipIdleEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        // If in combat mode (takes priority)
        if (this.combatMode) {
          return this.shipBattleEventNames;
        }

        let idleList = Array.isArray(this.shipDB.Commands.Idle)
          ? this.shipDB.Commands.Idle
          : [];
        if (
          this.useBonusLines &&
          Array.isArray(this.shipDB.Commands.IdleBonus)
        ) {
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

      try {
        // If in combat mode (takes priority)
        if (this.combatMode) {
          return this.shipBattleEventNames;
        }

        // If in special mode, return the special mode lines
        if (this.useSpecialLinesOnly) {
          return this.shipSpecialEventNames;
        }

        let tapList = Array.isArray(this.shipDB.Commands.Tap)
          ? this.shipDB.Commands.Tap
          : [];
        if (
          this.useBonusLines &&
          Array.isArray(this.shipDB.Commands.TapBonus)
        ) {
          tapList = tapList.concat(this.shipDB.Commands.TapBonus);
        }
        if (this.useSpecialLines && Array.isArray(this.shipSpecialEventNames)) {
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
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        return Array.isArray(this.shipDB.Commands.Hourly)
          ? this.shipDB.Commands.Hourly
          : [];
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipHourlyEventNames.", e);
      }
      return [];
    },
    // Battle
    shipBattleEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        let battleList = Array.isArray(this.shipDB.Commands.Battle)
          ? this.shipDB.Commands.Battle
          : [];

        let dayTime = this.isDayTime();
        if (dayTime && Array.isArray(this.shipDB.Commands.BattleDay)) {
          battleList = battleList.concat(this.shipDB.Commands.BattleDay);
        }
        if (!dayTime && Array.isArray(this.shipDB.Commands.BattleNight)) {
          battleList = battleList.concat(this.shipDB.Commands.BattleNight);
        }

        return battleList;
      } catch (e) {
        window.logError("[Ship] Unexpected error in shipBattleEventNames.", e);
      }
      return [];
    },
    // BattleStart
    shipBattleStartEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];
      try {
        let battleStartList = Array.isArray(this.shipDB.Commands.BattleStart)
          ? this.shipDB.Commands.BattleStart
          : [];

        let dayTime = this.isDayTime();
        if (dayTime && Array.isArray(this.shipDB.Commands.BattleStartDay)) {
          battleStartList = battleStartList.concat(
            this.shipDB.Commands.BattleStartDay
          );
        }
        if (!dayTime && Array.isArray(this.shipDB.Commands.BattleStartNight)) {
          battleStartList = battleStartList.concat(
            this.shipDB.Commands.BattleStartNight
          );
        }

        return battleStartList;
      } catch (e) {
        window.logError(
          "[Ship] Unexpected error in shipBattleStartEventNames.",
          e
        );
      }
      return [];
    },
    // BattleComplete
    shipBattleCompleteEventNames() {
      if (!this.shipDB || !this.shipDB.Commands) return [];

      try {
        return Array.isArray(this.shipDB.Commands.BattleComplete)
          ? this.shipDB.Commands.BattleComplete
          : [];
      } catch (e) {
        window.logError(
          "[Ship] Unexpected error in shipBattleCompleteEventNames.",
          e
        );
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
        window.logError("[Ship] Unexpected error in shipDamagedImagePath.", e);
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
    },
    useIdleLines() {
      this.resetIdleTimeout();
    },
    damagedMode() {
      this.resizeCanvas();
    }
  },
  async mounted() {
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", this.windowResizeHandler);
    window.addEventListener("hourly", this.onHourly);
    window.addEventListener("battleStart", this.battleStart);
    window.addEventListener("battleEnd", this.battleEnd);
    this.canvas.addEventListener("click", this.clickOnShip);

    this.audio.onended = this.audioHasEnded;
    this.audio.volume = this.voiceVolume;

    this.loadShip(true);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.windowResizeHandler);
    window.removeEventListener("hourly", this.onHourly);
    window.removeEventListener("battleStart", this.battleStart);
    window.removeEventListener("battleEnd", this.battleEnd);
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
    isDayTime() {
      let currentHour = new Date().getHours();
      return currentHour >= 7 && currentHour < 19;
    },
    windowResizeHandler() {
      this.resizeCanvas();
    },
    animateExitRight(callback) {
      this.isShipAnimationFinished = false;
      this.shipXPositionModifier = 0;

      let exitRight = () => {
        let widthToUse = Math.min(
          window.innerWidth,
          this.canvasCalculatedWidth
        );
        let absoluteBarrier = widthToUse + this.shipWidth;
        let absoluteBarrierRatio =
          absoluteBarrier / widthToUse - this.shipExpectedPositionRatio;

        // These are the conditions to end prematurely.
        if (
          this.isShipAnimationFinished ||
          this.shipXPositionModifier >= absoluteBarrierRatio
        ) {
          this.isShipAnimationFinished = true; // In case it did not end by the boolean
          if (callback && typeof callback === "function") {
            callback();
          }
          return;
        }

        let shipMovementInRatio = this.shipMovementSpeed / widthToUse;
        this.shipXPositionModifier += shipMovementInRatio;
        reqAnimFrame(exitRight);

        this.resizeCanvas();
      };
      exitRight();
    },
    animateEnterLeft(callback) {
      let initialWidth = Math.min(
        window.innerWidth,
        this.canvasCalculatedWidth
      );
      let startPoint = 0 - this.shipWidth;
      let startPointRatio =
        startPoint / initialWidth - this.shipExpectedPositionRatio;

      this.isShipAnimationFinished = false;
      this.shipXPositionModifier = startPointRatio;

      let enterLeft = () => {
        // These are the conditions to end prematurely.
        if (this.isShipAnimationFinished || this.shipXPositionModifier >= 0) {
          this.isShipAnimationFinished = true; // In case it did not end by the boolean
          if (callback && typeof callback === "function") {
            callback();
          }
          return;
        }

        let widthToUse = Math.min(
          window.innerWidth,
          this.canvasCalculatedWidth
        );
        let shipMovementInRatio = this.shipMovementSpeed / widthToUse;
        this.shipXPositionModifier += shipMovementInRatio;
        reqAnimFrame(enterLeft);

        this.resizeCanvas();
      };
      enterLeft();
    },
    battleStart() {
      this.animateExitRight(() => {
        // Turn on combat mode
        this.shipExpectedPositionRatio = shipCombatExpectedPositionRatio;
        this.$store.commit(
          "setCombatMode",
          new Date().getTime() + __combatModeLength
        );

        this.animateEnterLeft(() => {
          // Once done, reset the position modifier
          this.shipXPositionModifier = 0;
          this.resizeCanvas();
        });
      });

      // Play audio
      this.selectAndPlayEvent("onBattleStart", this.shipBattleStartEventNames);
    },
    battleEnd() {
      log("Ending Combat Phase");
      this.$store.commit("setCombatMode", null);
      this.shipXPositionModifier = 0;
      this.isShipAnimationFinished = true;
      this.shipExpectedPositionRatio = shipDefaultExpectedPositionRatio;
      this.resizeCanvas();

      this.selectAndPlayEvent(
        "onBattleComplete",
        this.shipBattleCompleteEventNames
      );
    },
    resetIdleTimeout() {
      if (this.idleTimeout) {
        window.clearTimeout(this.idleTimeout);
      }

      if (!this.useIdleLines) {
        return;
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
      if (this.currentEvent == null) return;

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
              if (this.useAllModelLines || models.includes(event.Model)) {
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
    onIdle() {
      if (this.idleTimeout) {
        window.clearTimeout(this.idleTimeout);
      }

      if (!this.useIdleLines) {
        return;
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
          let rewrappedEvent = JSON.parse(JSON.stringify(hourlyEvent));
          window.setTimeout(() => {
            log("Rewrapped event.", hourlyEvent);
            // Wait another 3 seconds as padding.
            this.onHourly(rewrappedEvent);
          }, 3000);
          return;
        }
      }

      try {
        log("Playing hourly event.", hourlyEvent);
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
    onLoad(loadedItem) {
      this.loadCounter++;
      console.log("[Ship] Loaded", loadedItem);
      if (this.loadCounter >= this.loadLimit) {
        window.dispatchEvent(new CustomEvent("shipLoaded"));
      }
    },
    async loadImage(imagePath, firstLoad = false) {
      if (!imagePath) return;
      return await this.$store.dispatch('loadImage', {
          imagePath,
          postLoad: () => {
            if (firstLoad) this.onLoad(imagePath);
          },
      });
    },
    async loadShip(firstLoad = false) {
      try {
        await this.getDatabase();
        this.defaultSprite = await this.loadImage(this.shipNormalImagePath, firstLoad);
        this.damagedSprite = await this.loadImage(this.shipDamagedImagePath, firstLoad);

        if (this.combatMode) {
          log("[Ship] Entering combat mode");
          this.shipExpectedPositionRatio = shipCombatExpectedPositionRatio;
        } else {
          this.shipExpectedPositionRatio = shipDefaultExpectedPositionRatio;
        }

        this.resizeCanvas(); // Also calls draw ship

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
      let widthToUse = Math.min(this.canvas.width, window.innerWidth);
      let shipExpectedPosition = 0;
      let shipActualPosition = 0;

      if (this.shipExpectedPositionRatio >= 0.5) {
        shipExpectedPosition = widthToUse * this.shipExpectedPositionRatio;
        shipActualPosition = Math.max(canvasCenterX, shipExpectedPosition);
      } else {
        // Reverse psychology (by pretending we're calculating from the right instead of the left)
        shipExpectedPosition =
          this.canvas.width - widthToUse * (1 - this.shipExpectedPositionRatio);
        shipActualPosition = Math.min(canvasCenterX, shipExpectedPosition);
      }

      let xOffset = this.shipXPositionOffset + shipActualPosition - shipCenterX;

      let spriteToDraw = this.damagedMode
        ? this.damagedSprite
        : this.defaultSprite;
      log("Sprite to draw", spriteToDraw);
      this.ctx.drawImage(spriteToDraw, xOffset, yOffset, width, height);
    },
    resizeCanvas() {
      //window.log(`Ship Resize: ${this.canvas.width}, ${this.canvas.height}`);
      try {
        this.clearCanvas();
        this.windowHeight = window.innerHeight;
        this.canvasCalculatedWidth = this.calculateWidthFromHeight(
          __room.naturalWidth,
          __room.naturalHeight,
          window.innerHeight
        );
        this.canvas.height = window.innerHeight;
        this.canvas.width = this.canvasCalculatedWidth;

        this.drawShip();
      } catch (e) {
        window.logError("[Ship] Error in resize. ", e);
      }
    }
  }
};
</script>