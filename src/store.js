import Vue from 'vue';
import Vuex from 'vuex';

import path from 'path';
import fs from 'fs';

Vue.config.productionTip = false;
Vue.use(Vuex);

window.roomBackground = {
  naturalWidth: 800,
  naturalHeight: 480
};

const store = new Vuex.Store({
  modules: {
    main: {
      state: {
        ships: [],
        database: {},
        bgm: {},
        subtitle: null,
      },
      getters: {
        bgm: s => JSON.parse(JSON.stringify(s.bgm)),
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
      },
      actions: {
        populateData: s => {
          let databasePath = path.join(__static, "database");
          if (!fs.existsSync(databasePath)) {
            console.warn(`[populateData] Unable to get database path at [${databasePath}]`);
            return;
          }

          //
          // Populate the ships
          //
          let shipDatabasePath = path.join(databasePath, "shipLines");
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
              console.warn(`[populateData] Unable to read ship database at path [${shipDatabasePath}]`, e);
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
            console.warn(`[populateData] Unable to read bgm database at path [${bgmPath}]`, e);
          }

          console.log('Ship data', ships, database);
          console.log('Bgm data', bgmDatabase);
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
            console.warn(`Unable to get database for [${shipName}]`, e);
          }
        }
      },
    }
  },
});

export default store;