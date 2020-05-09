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
        dataFiles: []
      },
      getters: {},
      mutations: {
        setDatabase(s, database) {
          s.database = database;
        },
        setDataFiles(s, dataFiles) {
          s.dataFiles = dataFiles;
        },
        setShips(s, ships) {
          s.ships = ships;
        },
      },
      actions: {
        populateData: s => {
          let databasePath = path.resolve("./src/database");
          let list = fs.readdirSync(databasePath);

          let ships = [];
          let database = {};
          list.map(filename => {
            try {
              let fileData = fs.readFileSync(path.join(databasePath, filename));
              let databaseData = JSON.parse(fileData);
              let shipName = databaseData.name;
              ships.push(shipName);
              database[shipName] = databaseData;
            } catch (e) {
              console.warn(`Unable to read database at path [${databasePath}]`, e);
            }
          });

          s.commit('setDatabase', database);
          s.commit('setDataFiles', list);
          s.commit('setShips', ships);
        },
        getDatabase: (s, shipName) => {
          try {
            console.log(shipName, s.rootState.main.database[shipName]);
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