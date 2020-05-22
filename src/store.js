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
};
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

const store = new Vuex.Store({
  modules: {
    main: {
      state: {
        shipNames: [],
        database: {},
        bgm: {},
        subtitle: null,
        title: null,
        selectedBgmName: "Main Menu",
        selectedShipName: "Yamato",
        selectedSpriteName: "Yamato",
        overallVolume: 1.0,
        bgmVolume: 1.0,
        voiceVolume: 1.0,

        // Ship settings
        useSpecialLines: false, // Whether the special occasion lines can be heard
        useSpecialLinesOnly: false, // Whether only the special occasion lines will be heard
        useBonusLines: false, // Whether only the TapBonus and IdleBonus lines will be heard
      },
      getters: {
        database: s => JSON.parse(JSON.stringify(s.database)),
        shipNames: s => JSON.parse(JSON.stringify(s.shipNames)),
        BGMs: s => JSON.parse(JSON.stringify(s.bgm.Events)),
        bgmCategories: s => JSON.parse(JSON.stringify(s.bgm.Categories)),
        bgmCategoryOrder: s => JSON.parse(JSON.stringify(s.bgm.CategoryOrder)),
        selectedBgm: s => s.selectedBgmName ? JSON.parse(JSON.stringify(s.bgm.Events[s.selectedBgmName])) : null,
        selectedShipName: s => JSON.parse(JSON.stringify(s.selectedShipName)),
        selectedSpriteName: s => JSON.parse(JSON.stringify(s.selectedSpriteName)),
        subtitle: s => JSON.parse(JSON.stringify(s.subtitle)),
        title: s => JSON.parse(JSON.stringify(s.title)),
        bgmVolume: s => s.bgmVolume * s.overallVolume,
        voiceVolume: s => s.voiceVolume * s.overallVolume,
        useSpecialLines: s => JSON.parse(JSON.stringify(s.useSpecialLines)),
        useSpecialLinesOnly: s => JSON.parse(JSON.stringify(s.useSpecialLinesOnly)),
        useBonusLines: s => JSON.parse(JSON.stringify(s.useBonusLines)),
      },
      mutations: {
        setDatabase(s, database) {
          s.database = database;
        },
        setShipNames(s, shipNames) {
          s.shipNames = shipNames;
        },
        setBgm(s, bgm) {
          s.bgm = bgm;
        },
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
        setOverallVolume(s, overallVolume) {
          utils.saveSetting("overallVolume", overallVolume);
          s.overallVolume = overallVolume;
        },
        setBgmVolume(s, bgmVolume) {
          utils.saveSetting("bgmVolume", bgmVolume);
          s.bgmVolume = bgmVolume;
        },
        setVoiceVolume(s, voiceVolume) {
          utils.saveSetting("voiceVolume", voiceVolume);
          s.voiceVolume = voiceVolume;
        },
        setUseSpecialLines(s, useSpecialLines) {
          utils.saveSetting("useSpecialLines", useSpecialLines);
          s.useSpecialLines = useSpecialLines;
        },
        setUseSpecialLinesOnly(s, useSpecialLinesOnly) {
          utils.saveSetting("useSpecialLinesOnly", useSpecialLinesOnly);
          s.useSpecialLinesOnly = useSpecialLinesOnly;
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
            "setVoiceVolume",
            "setUseSpecialLines",
            "setUseSpecialLinesOnly",
            "setUseBonusLines"
          ];
          let variableName = [
            "selectedBgmName",
            "selectedShipName",
            "selectedSpriteName",
            "overallVolume",
            "bgmVolume",
            "voiceVolume",
            "useSpecialLines",
            "useSpecialLinesOnly",
            "useBonusLines"
          ];
          let length = setters.length;

          for (let i = 0; i < length; i++) {
            let loadedData = utils.loadSetting(variableName[i]);
            if (loadedData) {
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

          window.log('Ship data', database);
          window.log('Bgm data', bgmDatabase);
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