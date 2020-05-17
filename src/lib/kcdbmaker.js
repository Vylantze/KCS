const fs = require('fs');
const path = require('path');

function titleCase(str) {
  if (!str) return str;
  try {
    let split = str.split(' ');
    let result = split.map(substring => {
      return substring[0].toUpperCase() + substring.slice(1);
    });
    return result.join(' ');
  } catch (e) {
    console.warn(`[titleCase] Unable to set ${str} to titleCase.`, e);
  }
  return str;
}

function kcdbMake(kanmusu, shipDir, databaseDir) {
  if (!kanmusu) {
    console.log("No ship detected");
    return;
  }
  console.log(`Running database creation on [${kanmusu}]`);

  let kanmusuPath = kanmusu.toLowerCase().replace(/ /g, "_");

  const dirpath = path.join(shipDir, kanmusuPath);
  if (!fs.existsSync(dirpath)) {
    console.log("Unable to find data at ", dirpath);
    return;
  }

  const linesPath = path.join(dirpath, 'lines.txt');
  if (!fs.existsSync(linesPath)) {
    console.log("Unable to find lines at ", linesPath);
    return;
  }

  const spritePath = path.join(dirpath, 'Sprites');
  if (!fs.existsSync(spritePath)) {
    console.log("Unable to find Sprites at ", spritePath);
    return;
  }

  const voicePath = path.join(dirpath, 'voices');
  if (!fs.existsSync(voicePath)) {
    console.log("Unable to find voices at ", voicePath);
    return;
  }

  const voiceFiles = fs.readdirSync(voicePath);
  const spriteFiles = fs.readdirSync(spritePath);

  const data = fs.readFileSync(linesPath, "utf8");
  const lines = data.replace(/\r/g, '').split('\n');

  //const srcSpritePath = `ship/${kanmusu}/sprites/`;
  //const srcVoicePath = `ship/${kanmusu}/voices/`;
  // For packing purposes, don't set the filepath
  const srcSpritePath = "";
  const srcVoicePath = "";

  const database = {
    Name: titleCase(kanmusu),
    Events: {}, // Contains all the events and their relevant data
    Commands: {}, // Contains a key mapped list of commands and a subarray of events that belong to that command e.g. { 'Command X': [ ... ] }
    Sprites: {}, // Should contain objects holding { Normal, Damaged, Banner, Card } data
  };
  var headers = [];
  var length = 0;
  lines.map((line, index) => {
    let split = line.split('\t');
    if (index == 0) {
      length = split.length;
      headers = split;
      return;
    }

    if (split.length != length) {
      console.log(`This line has something wrong [${line}]`);
      return;
    }
    let key = split[0];
    let entry = {};
    headers.map((header, headerIndex) => {
      entry[header] = split[headerIndex];
      if (header == 'Model') {
        key = `${key}/${entry[header]}`;
      }
      if (header == 'Command') {
        if (!database.Commands[entry[header]]) { database.Commands[entry[header]] = []; }
        database.Commands[entry[header]].push(key);
      }

      if (header == 'Voice') {
        if (voiceFiles.includes(entry[header])) {
          entry[header] = srcVoicePath + entry[header];
        } else {
          console.log(`Cannot find voice for [${key}/${entry[header]}].`, entry);
          entry[header] = null;
        }
      }
    });

    database.Events[key] = entry;
  });

  // Now get the sprite data
  spriteFiles.map(filename => {
    try {
      let name = filename.replace(/_Full|_Damaged|_Card|_Banner/g, '').replace(path.extname(filename), '').replace(/_/g, ' ').trim();
      if (!database.Sprites[name]) {
        database.Sprites[name] = {};
      }

      let filepath = srcSpritePath + filename;
      if (filename.includes("_Card")) {
        database.Sprites[name].Card = filepath;
      } else if (filename.includes("_Banner")) {
        database.Sprites[name].Banner = filepath;
      } else if (filename.includes("_Damaged")) {
        database.Sprites[name].Damaged = filepath;
      } else {
        database.Sprites[name].Normal = filepath;
      }
    } catch (e) {
      console.warn(`Failed to process sprite [${filename}]`);
    }
  });

  // Create a json file
  let databaseFile = path.join(databaseDir, `${kanmusu.toLowerCase()}.json`);
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  console.log(`[${kanmusu.toLowerCase()}.json] created at [${databaseFile}]`);
}

function bgmMake(publicDir, databaseDir) {
  const dirpath = path.join(publicDir, "bgm");
  if (!fs.existsSync(dirpath)) {
    console.log(`[bgmMake] Unable to find bgm folder at [${dirpath}]`);
    return;
  }

  const bgmDataPath = path.join(dirpath, "bgm.txt");
  if (!fs.existsSync(bgmDataPath)) {
    console.log(`[bgmMake] Unable to find bgm.txt at [${bgmDataPath}]`);
    return;
  }

  const bgmFiles = fs.readdirSync(dirpath);
  const data = fs.readFileSync(bgmDataPath, "utf8");
  const bgmData = data.replace(/\r/g, '').split('\n');

  // Set up the database. Just contain all data directly, keyed by the source
  const database = {
    Events: {},
    Categories: {},
    CategoryOrder: [],
  };

  // Now get the bgm data
  var headers = [];
  var length = 0;
  bgmData.map((line, index) => {
    let split = line.split('\t');
    if (index == 0) {
      length = split.length;
      headers = split;
      return;
    }

    if (split.length != length) {
      console.log(`This line has something wrong [${line}]`);
      return;
    }

    let key = split[0];
    let entry = {};
    headers.map((header, headerIndex) => {
      entry[header] = split[headerIndex];

      if (header == 'File') {
        if (bgmFiles.includes(entry[header])) {
          entry[header] = `bgm/${entry[header]}`;
        } else {
          console.log(`Cannot find sound file for [${key}/${entry[header]}].`, entry);
          entry[header] = null;
        }
      }

      if (header == 'Category') {
        if (!database.CategoryOrder.includes(entry[header])
          && entry[header] != 'Battle' // We want Battle bgm to be special
        ) {
          database.CategoryOrder.push(entry[header]);
        }

        if (!database.Categories[entry[header]]) {
          database.Categories[entry[header]] = [];
        }
        database.Categories[entry[header]].push(key);
      }
    });

    database.Events[key] = entry;
  });

  // Create a json file
  let databaseFile = path.join(databaseDir, 'bgm.json');
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  console.log(`['bgm.json] created at [${databaseFile}]`);
}

function seMake(publicDir, databaseDir) {
  const dirpath = path.join(publicDir, "se");
  if (!fs.existsSync(dirpath)) {
    console.log(`[seMake] Unable to find se folder at [${dirpath}]`);
    return;
  }

  const seDataPath = path.join(dirpath, "se.txt");
  if (!fs.existsSync(seDataPath)) {
    console.log(`[seMake] Unable to find se.txt at [${seDataPath}]`);
    return;
  }

  const seFiles = fs.readdirSync(dirpath);
  const data = fs.readFileSync(seDataPath, "utf8");
  const seData = data.replace(/\r/g, '').split('\n');

  // Set up the database. Just contain all data directly, keyed by the source
  const database = {};

  // Now get the bgm data
  var headers = [];
  var length = 0;
  seData.map((line, index) => {
    let split = line.split('\t');
    if (index == 0) {
      length = split.length;
      headers = split;
      return;
    }

    if (split.length != length) {
      console.log(`This line has something wrong [${line}]`);
      return;
    }

    let key = split[0];
    let entry = {};
    headers.map((header, headerIndex) => {
      entry[header] = split[headerIndex];

      if (header == 'File') {
        if (seFiles.includes(entry[header])) {
          entry[header] = `se/${entry[header]}`;
        } else {
          console.log(`Cannot find sound file for [${key}/${entry[header]}].`, entry);
          entry[header] = null;
        }
      }
    });

    database[key] = entry;
  });

  // Create a json file
  let databaseFile = path.join(databaseDir, 'se.json');
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  console.log(`['se.json] created at [${databaseFile}]`);
}

function runBgmMakeFromNode() {
  let databasePath = path.join(process.cwd(), 'public', 'database');
  if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
  bgmMake(path.join(process.cwd(), 'public'), databasePath);
}

function runKCMakeFromNode() {
  var kanmusu = null;
  try {
    if (process.argv != null && process.argv.length > 1) {
      kanmusu = process.argv.slice(1).join(' ');
      let databasePath = path.join(process.cwd(), 'public', 'database', 'ship');
      if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
      kcdbMake(kanmusu, path.join(process.cwd(), 'ship'), databasePath);
    }
  } catch (e) {
    console.log("Unable to run maker from the following: ", process.argv, e);
    return;
  }
}

function runSEMakeFromNode() {
  let databasePath = path.join(process.cwd(), 'public', 'database');
  if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
  seMake(path.join(process.cwd(), 'public'), databasePath);
}

module.exports = {
  runBgmMakeFromNode,
  runKCMakeFromNode,
  runSEMakeFromNode,
  bgmMake,
  kcdbMake,
  seMake
};