import Vue from 'vue';
import Vuex from 'vuex';

import './lib/preload';
import utils from './lib/utils';
import path from "path";

Vue.config.productionTip = false;
Vue.use(Vuex);

// Database import
import bgm from './database/bgm.json'
import se from './database/se.json'
import titleLines from './database/title.json'

import akizuki from './database/ship/akizuki.json'
import haguro from './database/ship/haguro.json'
import sendai from './database/ship/sendai.json'
import taigei from './database/ship/taigei.json'
import yamato from './database/ship/yamato.json'

const ships = [
  akizuki,
  haguro,
  sendai,
  taigei,
  yamato,
];

var combatModeInterval = null;

const store = new Vuex.Store({
  modules: {
    main: {
      state: {
        // Databases
        database: {}, // Main ship database
        shipNames: [], // The list of ship names that are available

        // Subtitle/overlays
        subtitle: null,
        title: null,

        // Selected items
        selectedBgmName: "Main Menu",
        selectedShipName: "Yamato",
        selectedSpriteName: "Yamato",

        // Overall states
        combatMode: false, // Indicates whether the game is in combat mode
        loadingMode: false, // Indicates whether the game is loading
        damagedMode: false, // Indicates whether the ship is damaged

        // Volume settings
        overallVolume: 0.2,
        bgmVolume: 0.5,
        seVolume: 0.2,
        voiceVolume: 1.0,

        overallVolumeMute: false,
        bgmVolumeMute: false,
        seVolumeMute: false,
        voiceVolumeMute: false,

        // Ship settings
        idleLineWait: 5,
        useAllModelLines: false,
        useIdleLines: true,
        useSpecialLines: false, // Whether the special occasion lines can be heard
        useSpecialLinesOnly: false, // Whether only the special occasion lines will be heard
        useBonusLines: false, // Whether only the TapBonus and IdleBonus lines will be heard
      },
      getters: {
        database: s => JSON.parse(JSON.stringify(s.database)),
        BGMs: () => JSON.parse(JSON.stringify(bgm.Events)),
        SEs: () => JSON.parse(JSON.stringify(se)),
        titleLines: () => JSON.parse(JSON.stringify(titleLines)),
        shipNames: s => JSON.parse(JSON.stringify(s.shipNames)),

        combatMode: s => JSON.parse(JSON.stringify(s.combatMode)),
        loadingMode: s => JSON.parse(JSON.stringify(s.loadingMode)),
        damagedMode: s => JSON.parse(JSON.stringify(s.damagedMode)),

        bgmCategories: () => JSON.parse(JSON.stringify(bgm.Categories)),
        bgmCategoryOrder: () => JSON.parse(JSON.stringify(bgm.CategoryOrder)),

        selectedBgm: s => s.selectedBgmName ? JSON.parse(JSON.stringify(bgm.Events[s.selectedBgmName])) : null,
        selectedShipName: s => JSON.parse(JSON.stringify(s.selectedShipName)),
        selectedSpriteName: s => JSON.parse(JSON.stringify(s.selectedSpriteName)),

        subtitle: s => JSON.parse(JSON.stringify(s.subtitle)),
        title: s => JSON.parse(JSON.stringify(s.title)),

        bgmVolume: s => s.overallVolumeMute || s.bgmVolumeMute ? 0 : s.bgmVolume * s.overallVolume,
        seVolume: s => s.overallVolumeMute || s.seVolumeMute ? 0 : s.seVolume * s.overallVolume,
        voiceVolume: s => s.overallVolumeMute || s.voiceVolumeMute ? 0 : s.voiceVolume * s.overallVolume,

        idleLineWait: s => JSON.parse(JSON.stringify(s.idleLineWait)),

        useIdleLines: s => JSON.parse(JSON.stringify(s.useIdleLines)),
        useSpecialLines: s => JSON.parse(JSON.stringify(s.useSpecialLines)),
        useSpecialLinesOnly: s => JSON.parse(JSON.stringify(s.useSpecialLinesOnly)),
        useBonusLines: s => JSON.parse(JSON.stringify(s.useBonusLines)),
        useAllModelLines: s => JSON.parse(JSON.stringify(s.useAllModelLines)),

        disclaimer: () => "This app is free and for private use only. No shipgirls can be hurt during the running of this app. They are just pretending."
      },
      mutations: {
        // set databases
        setDatabase(s, database) {
          s.database = database;
        },
        setShipNames(s, shipNames) {
          s.shipNames = shipNames;
        },
        setCombatMode(s, combatMode) {
          // Expects input of the end time

          if (combatMode) {
            try {
              let dateTime = new Date(combatMode);
              if (combatMode && dateTime > new Date()) {
                s.combatMode = combatMode;
                utils.saveSetting("combatMode", combatMode);

                let timeLeft = dateTime.getTime() - new Date().getTime();
                combatModeInterval = window.setInterval(() => {
                  s.combatMode = null;
                  window.dispatchEvent(new CustomEvent("battleEnd"));
                }, timeLeft);
                log('Time left until Combat ends: ', timeLeft);
              }
            } catch (e) {
              combatMode = null;
              log("[setCombatMode] Error. ", e);
            }
          }

          if (!combatMode) {
            s.combatMode = null;
            utils.saveSetting("combatMode", null);
            if (combatModeInterval) {
              window.clearInterval(combatModeInterval);
            }
          }
        },
        setLoadingMode(s, loadingMode) {
          s.loadingMode = loadingMode;
        },
        setDamagedMode(s, damagedMode) {
          log("setDamagedMode", damagedMode);
          s.damagedMode = damagedMode;
        },
        // Set the title subtitle
        setTitle(s, title) {
          s.title = title;
        },
        setSubtitle(s, subtitle) {
          s.subtitle = subtitle;
        },
        setSelectedBgmName(s, selectedBgmName) {
          utils.saveSetting("selectedBgmName", selectedBgmName);
          s.selectedBgmName = selectedBgmName;
        },
        setSelectedBgm(s, selectedBgm) {
          utils.saveSetting("selectedBgmName", selectedBgm.Source);
          s.selectedBgmName = selectedBgm.Source;
        },
        setSelectedShipName(s, selectedShipName) {
          utils.saveSetting("selectedShipName", selectedShipName);
          s.selectedShipName = selectedShipName;
        },
        setSelectedSpriteName(s, selectedSpriteName) {
          utils.saveSetting("selectedSpriteName", selectedSpriteName);
          s.selectedSpriteName = selectedSpriteName;
        },
        // Set volume
        setOverallVolume(s, overallVolume) {
          utils.saveSetting("overallVolume", overallVolume);
          s.overallVolume = overallVolume;
        },
        setBgmVolume(s, bgmVolume) {
          utils.saveSetting("bgmVolume", bgmVolume);
          s.bgmVolume = bgmVolume;
        },
        setSeVolume(s, seVolume) {
          utils.saveSetting("seVolume", seVolume);
          s.seVolume = seVolume;
        },
        setVoiceVolume(s, voiceVolume) {
          utils.saveSetting("voiceVolume", voiceVolume);
          s.voiceVolume = voiceVolume;
        },
        // Set mute
        setOverallVolumeMute(s, overallVolumeMute) {
          utils.saveSetting("overallVolumeMute", overallVolumeMute);
          s.overallVolumeMute = overallVolumeMute;
        },
        setBgmVolumeMute(s, bgmVolumeMute) {
          utils.saveSetting("bgmVolumeMute", bgmVolumeMute);
          s.bgmVolumeMute = bgmVolumeMute;
        },
        setSeVolumeMute(s, seVolumeMute) {
          utils.saveSetting("seVolumeMute", seVolumeMute);
          s.seVolumeMute = seVolumeMute;
        },
        setVoiceVolumeMute(s, voiceVolumeMute) {
          utils.saveSetting("voiceVolumeMute", voiceVolumeMute);
          s.voiceVolumeMute = voiceVolumeMute;
        },
        // Set Ship settings
        setIdleLineWait(s, idleLineWait) {
          utils.saveSetting("idleLineWait", idleLineWait);
          s.idleLineWait = idleLineWait;
        },
        setUseIdleLines(s, useIdleLines) {
          utils.saveSetting("useIdleLines", useIdleLines);
          s.useIdleLines = useIdleLines;
        },
        setUseSpecialLines(s, useSpecialLines) {
          utils.saveSetting("useSpecialLines", useSpecialLines);
          s.useSpecialLines = useSpecialLines;
        },
        setUseSpecialLinesOnly(s, useSpecialLinesOnly) {
          utils.saveSetting("useSpecialLinesOnly", useSpecialLinesOnly);
          s.useSpecialLinesOnly = useSpecialLinesOnly;
        },
        setUseAllModelLines(s, useAllModelLines) {
          utils.saveSetting("useAllModelLines", useAllModelLines);
          s.useAllModelLines = useAllModelLines;
        },
        setUseBonusLines(s, useBonusLines) {
          utils.saveSetting("useBonusLines", useBonusLines);
          s.useBonusLines = useBonusLines;
        }
      },
      actions: {
        loadSettings: s => {
          let setters = [
            "setSelectedBgmName",
            "setSelectedShipName",
            "setSelectedSpriteName",

            "setOverallVolume",
            "setBgmVolume",
            "setSeVolume",
            "setVoiceVolume",

            "setOverallVolumeMute",
            "setBgmVolumeMute",
            "setSeVolumeMute",
            "setVoiceVolumeMute",

            "setIdleLineWait",
            "setUseIdleLines",
            "setUseSpecialLines",
            "setUseSpecialLinesOnly",
            "setUseBonusLines",
            "setUseAllModelLines",

            "setCombatMode",
            "setDamagedMode",
          ];
          let variableName = [
            "selectedBgmName",
            "selectedShipName",
            "selectedSpriteName",

            "overallVolume",
            "bgmVolume",
            "seVolume",
            "voiceVolume",

            "overallVolumeMute",
            "bgmVolumeMute",
            "seVolumeMute",
            "voiceVolumeMute",

            "idleLineWait",
            "useIdleLines",
            "useSpecialLines",
            "useSpecialLinesOnly",
            "useBonusLines",
            "useAllModelLines",

            "combatMode",
            "damagedMode",
          ];

          if (setters.length != variableName.length) {
            logError(`[store] Setter length (${setters.length}) and variableName length (${variableName.length}) are different.`);
          }

          let length = setters.length;

          for (let i = 0; i < length; i++) {
            let loadedData = utils.loadSetting(variableName[i]);
            if (loadedData != null) {
              log(`Setting [${variableName[i]}]:`, loadedData);
              s.commit(setters[i], loadedData);
            }
          }
        },
        populateData: s => {
          //
          // Populate the ships
          //
          let shipNames = [];
          let database = {};
          ships.map(ship => {
            try {
              let databaseData = JSON.parse(JSON.stringify(ship));
              let shipName = databaseData.Name;
              shipNames.push(shipName);
              database[shipName] = databaseData;
            } catch (e) {
              window.logError(`[populateData] Unable to read ship database`, e);
            }
          });
          log("ShipNames", shipNames);

          s.commit('setDatabase', database);
          s.commit('setShipNames', shipNames);

          window.log('Ship data', database);
          window.log('Bgm data', bgm);
          window.log('SE data', se);
          window.log('Title data', titleLines);
        },
        loadImage: (s, { imagePath, postLoad }) => {
          return new Promise(resolve => {
            try {
              let image = new Image();
              image.onload = () => {
                if (postLoad && typeof postLoad === 'function') postLoad();
                resolve(image);
              };
              image.onerror = (e) => {
                console.warn('[loadImage] onerror', e);
                resolve(null);
              }
              image.src = imagePath;
            } catch (e) {
              console.warn('[loadImage] Error', e);
              resolve(null);
            }
          });
        },
        loadAudio: (s, { audioPath, postLoad }) => {
          return new Promise(resolve => {
            try {
              const audio = new Audio();
              audio.oncanplaythrough = () => {
                if (postLoad && typeof postLoad === 'function') postLoad();
                resolve(audio);
              };
              audio.onerror = (e) => {
                console.warn('[loadAudio] onerror', e);
                resolve(null);
              }
              audio.src = audioPath;
            } catch (e) {
              console.warn('[loadAudio] Error', e);
              resolve(null);
            }
          });
        },
        invokeHourlyEvent: () => {
          let hour = new Date().getHours();
          let hourly = new CustomEvent('hourly', { detail: `${hour.pad(2)}:00` });
          window.dispatchEvent(hourly);
        },
        startIntervalTimer: s => {
          var previousHour = new Date().getHours();
          window.setInterval(() => {
            // Check this every second
            let currentHour = new Date().getHours();
            if (currentHour !== previousHour) {
              previousHour = currentHour;
              s.dispatch('invokeHourlyEvent');
            }
          }, 1000);
        },
        startEventListeners() {
          return null;
        },
        getDatabase: (s, shipName) => {
          try {
            return s.rootState.main.database[shipName];
          } catch (e) {
            window.logError(`Unable to get database for [${shipName}]`, e);
          }
        },
        preloadShipCards: s => {
          // Preload ship cards
          ships.map(ship => {
            try {
              let shipFileName = ship.FileName;
              let spritesList = Object.keys(ship.Sprites);
              spritesList.forEach(spriteName => {
                if (!ship.Sprites[spriteName]) { return; }
                let card = ship.Sprites[spriteName].Card;
                if (!card) { return; }
                let imagePath = path.join(window.__ship, shipFileName, "sprites", card);
                s.dispatch("loadImage", {
                  imagePath,
                  postLoad: () => {
                    console.log(`[preloadShipCards] Loaded ${card}`);
                  },
                });
              });
            } catch (e) {
              console.warn(`[preloadShipCards][${ship.Name}] Error`, e);
            }
          });
        },
      },
    }
  },
});

export default store;