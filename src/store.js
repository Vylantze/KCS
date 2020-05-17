import Vue from 'vue';
import Vuex from 'vuex';

import path from 'path';
import fs from 'fs';

import utils from './lib/utils';

Vue.config.productionTip = false;
Vue.use(Vuex);

const isDevelopment = process.env.NODE_ENV !== 'production';

window.__dev = isDevelopment;
window.__roomBackground = {
  naturalWidth: 800,
  naturalHeight: 480
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
        ships: [],
        database: {},
        bgm: {},
        subtitle: null,
        selectedBgmName: "Main Menu",
        selectedShipName: "Yamato",
        selectedSprite: "Yamato Summer",
      },
      getters: {
        BGMs: s => JSON.parse(JSON.stringify(s.bgm.Events)),
        bgmCategories: s => JSON.parse(JSON.stringify(s.bgm.Categories)),
        bgmCategoryOrder: s => JSON.parse(JSON.stringify(s.bgm.CategoryOrder)),
        selectedBgm: s => s.selectedBgmName ? JSON.parse(JSON.stringify(s.bgm.Events[s.selectedBgmName])) : null,
        selectedShipName: s => JSON.parse(JSON.stringify(s.selectedShipName)),
        shipSprite: s => JSON.parse(JSON.stringify(s.selectedSprite)),
        ships: s => JSON.parse(JSON.stringify(s.ships)),
        subtitle: s => JSON.parse(JSON.stringify(s.subtitle)),
      },
      mutations: {
        setDatabase(s, database) {
          s.database = database;
        },
        setShips(s, ships) {
          s.ships = ships;
        },
        setBgm(s, bgm) {
          s.bgm = bgm;
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
        setSelectedSprite(s, selectedSprite) {
          utils.saveSetting("selectedSprite", selectedSprite);
          s.selectedSprite = selectedSprite;
        }
      },
      actions: {
        loadSettings: s => {
          let setters = [
            "setSelectedBgmName",
            "setSelectedShipName",
            "setSelectedSprite"
          ];
          let variableName = [
            "selectedBgmName",
            "selectedShipName",
            "selectedSprite"
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

          let ships = [];
          let database = {};
          list.map(filename => {
            try {
              let fileData = fs.readFileSync(path.join(shipDatabasePath, filename));
              let databaseData = JSON.parse(fileData);
              let shipName = databaseData.Name;
              ships.push(shipName);
              database[shipName] = databaseData;
            } catch (e) {
              window.logError(`[populateData] Unable to read ship database at path [${shipDatabasePath}]`, e);
            }
          });

          s.commit('setDatabase', database);
          s.commit('setShips', ships);

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

          window.log('Ship data', ships, database);
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