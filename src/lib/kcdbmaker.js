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
  //console.log(`Running database creation on [${kanmusu}]`);

  let kanmusuPath = kanmusu.toLowerCase().replace(/ /g, "_");

  const dirpath = path.join(shipDir, kanmusuPath);
  if (!fs.existsSync(dirpath)) {
    console.log("Unable to find data at ", dirpath);
    return;
  }

  const linesPath = path.join(dirpath, 'lines.txt');
  if (!fs.existsSync(linesPath)) {
    console.log("Unable to find lines.txt at ", linesPath);
    return;
  }

  const spriteDataPath = path.join(dirpath, 'spriteData.txt');
  if (!fs.existsSync(spriteDataPath)) {
    console.log("Unable to find spriteData.txt at ", linesPath);
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

  const lineData = fs.readFileSync(linesPath, "utf8");
  const lines = lineData.replace(/\r/g, '').split('\n');
  const spriteDataRaw = fs.readFileSync(spriteDataPath, "utf8");
  const spriteData = spriteDataRaw.replace(/\r/g, '').split('\n');

  //const srcSpritePath = `ship/${kanmusu}/sprites/`;
  //const srcVoicePath = `ship/${kanmusu}/voices/`;
  // For packing purposes, don't set the filepath
  const srcSpritePath = "";
  const srcVoicePath = "";

  const database = {
    Name: titleCase(kanmusu),
    FileName: kanmusu.toLowerCase(),
    Events: {}, // Contains all the events and their relevant data
    Commands: {}, // Contains a key mapped list of commands and a subarray of events that belong to that command e.g. { 'Command X': [ ... ] }
    Sprites: {}, // Should contain objects holding { Normal, Damaged, Banner, Card } data
    DefaultBanner: null, // Default banner to use for display
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

    if (!database.Events[key]) database.Events[key] = [];
    database.Events[key].push(entry);
  });

  // Map sprite data object
  const spriteDatabase = {};
  spriteData.map((line, index) => {
    let split = line.split('\t');

    if (split.length != 2) {
      console.log(`[spriteData] This line has something wrong [${line}]`);
      return;
    }

    let key = split[0];

    if (key == "Banner") {
      database.DefaultBanner = split[1];
      return;
    }

    let entry = {};
    entry.Models = split[1].split('|');
    entry.Index = index;
    spriteDatabase[key] = entry;
  });

  // Now get the sprite data
  spriteFiles.map(filename => {
    try {
      let name = filename.replace(/_Full|_Damaged|_Card|_Banner/g, '').replace(path.extname(filename), '').replace(/_/g, ' ').trim();
      let bannerInfo = filename.replace(path.extname(filename), '').replace(/_/g, ' ').replace(name, '').replace(/ /g, '').trim();
      if (!database.Sprites[name]) {
        database.Sprites[name] = {};
      }

      //console.log(filename, `[BannerInfo:${bannerInfo}]`, `[Card:${filename.includes("_Card")}/Banner:${filename.includes("_Banner")}/Damaged:${filename.includes("_Damaged")}]`);

      let filepath = srcSpritePath + filename;
      if (bannerInfo == "Full") {
        database.Sprites[name].Normal = filepath;
      } else if (bannerInfo == "FullDamaged") {
        database.Sprites[name].Damaged = filepath;
      } else {
        database.Sprites[name][bannerInfo] = filepath;
      }

      if (!spriteDatabase[name]) {
        console.log(`SpriteDatabase does not contain [${name}]`);
        return;
      }

      database.Sprites[name] = { ...database.Sprites[name], ...spriteDatabase[name] };
    } catch (e) {
      console.warn(`Failed to process sprite [${filename}]`);
    }
  });

  // Create a json file
  let databaseFile = path.join(databaseDir, `${kanmusu.toLowerCase()}.json`);
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  //console.log(`[${kanmusu.toLowerCase()}.json] created at [${databaseFile}]`);

  console.log(`   [${titleCase(kanmusu)}] [${kanmusu.toLowerCase()}.json]`);
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

    database[key] = entry.File;
  });

  // Create a json file
  let databaseFile = path.join(databaseDir, 'se.json');
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  console.log(`['se.json] created at [${databaseFile}]`);
}

function titleMake(publicDir, databaseDir) {
  const dirpath = path.join(publicDir, "title");
  if (!fs.existsSync(dirpath)) {
    console.log(`[titleMake] Unable to find title folder at [${dirpath}]`);
    return;
  }

  const titleDataPath = path.join(dirpath, "title.txt");
  if (!fs.existsSync(titleDataPath)) {
    console.log(`[titleMake] Unable to find title.txt at [${titleDataPath}]`);
    return;
  }

  const titleFiles = fs.readdirSync(dirpath);
  const data = fs.readFileSync(titleDataPath, "utf8");
  const titleData = data.replace(/\r/g, '').split('\n');

  // Set up the database. Just contain all data directly, keyed by the source
  const database = {};

  // Now get the bgm data
  var headers = [];
  var length = 0;
  titleData.map((line, index) => {
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
        if (titleFiles.includes(entry[header])) {
          entry[header] = `title/${entry[header]}`;
        } else {
          console.log(`Cannot find sound file for [${key}/${entry[header]}].`, entry);
          entry[header] = null;
        }
      }
    });

    if (!database[key]) {
      database[key] = [];
    }
    database[key].push(entry);
  });

  // Create a json file
  let databaseFile = path.join(databaseDir, 'title.json');
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  console.log(`['title.json] created at [${databaseFile}]`);
}

function runBgmMakeFromNode() {
  let databasePath = path.join(process.cwd(), 'public', 'database');
  if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
  bgmMake(path.join(process.cwd(), 'public'), databasePath);
}

function runSEMakeFromNode() {
  let databasePath = path.join(process.cwd(), 'public', 'database');
  if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
  seMake(path.join(process.cwd(), 'public'), databasePath);
}

function runTitleMakeFromNode() {
  let databasePath = path.join(process.cwd(), 'public', 'database');
  if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
  titleMake(path.join(process.cwd(), 'public'), databasePath);
}

function runKCMakeFromNode() {
  var kanmusu = null;
  try {
    if (process.argv != null && process.argv.length <= 1) { return; }
    kanmusu = process.argv.slice(1).join(' ');
    let databasePath = path.join(process.cwd(), 'public', 'database', 'ship');
    if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
    console.log(`[runKCMakeFromNode] Running database creation on [${kanmusu}]`);
    kcdbMake(kanmusu, path.join(process.cwd(), 'public', 'ship'), databasePath);
  } catch (e) {
    console.log("Unable to run maker from the following: ", process.argv, e);
    return;
  }
}

function runAllKCMakeFromNode() {
  try {
    let databasePath = path.join(process.cwd(), 'public', 'database', 'ship');
    if (!fs.existsSync(databasePath)) { fs.mkdirSync(databasePath, { recursive: true }); }
    let shipPath = path.join(process.cwd(), 'public', 'ship');
    if (!fs.existsSync(shipPath)) {
      console.log("[runAllKCMakeFromNode] No ships found.");
      return;
    }

    const ships = fs.readdirSync(shipPath);
    ships.map(ship => {
      kcdbMake(ship, shipPath, databasePath);
    });

    runBgmMakeFromNode();
    runSEMakeFromNode();
    runTitleMakeFromNode();
  } catch (e) {
    console.log("Unable to run maker from the following: ", process.argv, e);
    return;
  }
}

module.exports = {
  runBgmMakeFromNode,
  runSEMakeFromNode,
  runKCMakeFromNode,
  runTitleMakeFromNode,
  runAllKCMakeFromNode,
  bgmMake,
  kcdbMake,
  seMake,
  titleMake
};