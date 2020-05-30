import Vue from 'vue';
import Vuex from 'vuex';

import path from 'path';
import fs from 'fs';

import utils from './lib/utils';

Vue.config.productionTip = false;
Vue.use(Vuex);

const isDevelopment = process.env.NODE_ENV !== 'production';

window.__dev = isDevelopment;
window.__room = {
  naturalWidth: 800,
  naturalHeight: 480,
  desk: {
    width: 362,
    height: 346,
  },
  wallObject: {
    width: 144,
    height: 178,
  },
  loading: {
    width: 145,
    height: 145,
  }
};
window.__combatModeLength = 5 * 60 * 1000; // In milliseconds
window.__mobileMode = {
  width: 600,
};
window.__resources = path.resolve(path.join(__static, ".."));
window.__ship = "ship";
//window.__ship = isDevelopment ? path.join(__resources, "packed", "ship") : path.join(__resources, "ship"); // Old one for .asar packaging

if (isDevelopment) {
  window.log = console.log.bind(window.console);
  window.logError = console.warn.bind(window.console);
} else {
  window.log = () => { };
  window.logError = () => { };
}

var combatModeInterval = null;

const store = new Vuex.Store({
  modules: {
    main: {
      state: {
        // Databases
        database: {}, // Main ship database
        bgm: {}, // BGM database
        se: {}, // SE database
        titleLines: {}, // Title lines database
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
        loadingMode: false, // Indicates whether the game is in combat mode

        // Volume settings
        overallVolume: 1.0,
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
        BGMs: s => JSON.parse(JSON.stringify(s.bgm.Events)),
        SEs: s => JSON.parse(JSON.stringify(s.se)),
        titleLines: s => JSON.parse(JSON.stringify(s.titleLines)),
        shipNames: s => JSON.parse(JSON.stringify(s.shipNames)),

        combatMode: s => JSON.parse(JSON.stringify(s.combatMode)),
        loadingMode: s => JSON.parse(JSON.stringify(s.loadingMode)),

        bgmCategories: s => JSON.parse(JSON.stringify(s.bgm.Categories)),
        bgmCategoryOrder: s => JSON.parse(JSON.stringify(s.bgm.CategoryOrder)),

        selectedBgm: s => s.selectedBgmName ? JSON.parse(JSON.stringify(s.bgm.Events[s.selectedBgmName])) : null,
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
        setBgm(s, bgm) {
          s.bgm = bgm;
        },
        setSe(s, se) {
          s.se = se;
        },
        // Set the ship lines for the title screen
        setTitleLines(s, titleLines) {
          s.titleLines = titleLines;
        },
        setCombatMode(s, combatMode) {
          // Input the end time
          try {
            let dateTime = new Date(combatMode);
            if (combatMode && dateTime > new Date()) {
              s.combatMode = combatMode;
              utils.saveSetting("combatMode", combatMode);

              let timeLeft = dateTime.getTime() - new Date().getTime();
              combatModeInterval = window.setInterval(() => {
                s.commit('setCombatMode', null);
              }, timeLeft);
              log('Time left until Combat ends: ', timeLeft);
            }
          } catch (e) {
            combatMode = null;
            log("[setCombatMode] Error. ", e);
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
            "combatMode"
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
          let databasePath = path.join(__static, "database");
          if (!fs.existsSync(databasePath)) {
            window.logError(`[populateData] Unable to get database path at [${databasePath}]`);
            return;
          }

          //
          // Populate the ships
          //
          let shipDatabasePath = path.join(databasePath, "ship");
          let list = fs.readdirSync(shipDatabasePath);

          let shipNames = [];
          let database = {};
          list.map(filename => {
            try {
              let fileData = fs.readFileSync(path.join(shipDatabasePath, filename));
              let databaseData = JSON.parse(fileData);
              let shipName = databaseData.Name;
              shipNames.push(shipName);
              database[shipName] = databaseData;
            } catch (e) {
              window.logError(`[populateData] Unable to read ship database at path [${shipDatabasePath}]`, e);
            }
          });
          log("ShipNames", shipNames);

          s.commit('setDatabase', database);
          s.commit('setShipNames', shipNames);

          //
          // Populate the bgm data
          //
          let bgmPath = path.join(databasePath, "bgm.json");
          let bgmDatabase = {};
          try {
            let bgmData = fs.readFileSync(bgmPath);
            bgmDatabase = JSON.parse(bgmData);
            s.commit('setBgm', bgmDatabase);
          } catch (e) {
            window.logError(`[populateData] Unable to read bgm database at path [${bgmPath}]`, e);
          }

          //
          // Populate the se data
          //
          let sePath = path.join(databasePath, "se.json");
          let seDatabase = {};
          try {
            let seData = fs.readFileSync(sePath);
            seDatabase = JSON.parse(seData);
            s.commit('setSe', seDatabase);
          } catch (e) {
            window.logError(`[populateData] Unable to read se database at path [${sePath}]`, e);
          }

          // Populate the title data
          let titleLinesPath = path.join(databasePath, "title.json");
          let titleLinesDatabase = {};
          try {
            let titleData = fs.readFileSync(titleLinesPath);
            titleLinesDatabase = JSON.parse(titleData);
            s.commit('setTitleLines', titleLinesDatabase);
          } catch (e) {
            window.logError(`[populateData] Unable to read title database at path [${titleLinesPath}]`, e);
          }


          window.log('Ship data', database);
          window.log('Bgm data', bgmDatabase);
          window.log('SE data', seDatabase);
          window.log('Title data', titleLinesDatabase);
        },
        invokeHourlyEvent: () => {
          let hourly = new CustomEvent('hourly', { detail: `${new Date().getHours()}:00` });
          window.dispatchEvent(hourly);
        },
        startIntervalTimer: s => {
          let hourInMilliseconds = 1000 * 60 * 60;
          let timeToHourChange = 3600000 - new Date().getTime() % 3600000 + 1;
          window.setTimeout(() => {
            s.dispatch('invokeHourlyEvent');
            window.setInterval(() => {
              s.dispatch('invokeHourlyEvent');
            }, hourInMilliseconds);
          }, timeToHourChange);
        },
        getDatabase: (s, shipName) => {
          try {
            return s.rootState.main.database[shipName];
          } catch (e) {
            window.logError(`Unable to get database for [${shipName}]`, e);
          }
        }
      },
    }
  },
});

export default store;