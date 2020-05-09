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

function kcdbMake(kanmusu, publicPath, databasePath) {
  if (!kanmusu) {
    console.log("No ship detected");
    return;
  }
  console.log(`Running database creation on [${kanmusu}]`);

  const dirpath = path.join(publicPath, 'ship', kanmusu);
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


  const database = {
    Name: titleCase(kanmusu),
    Events: {},
    Commands: {},
    Sprites: {}, // Should contain objects holding { Normal, Damaged } data
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
      if (header == 'Voice' && !voiceFiles.includes(entry[header])) {
        console.log(`Cannot find voice for [${key}/${entry[header]}].`, entry);
        entry[header] = null;
      }
      if (header == 'Command') {
        if (!database.Commands[entry[header]]) { database.Commands[entry[header]] = []; }
        database.Commands[entry[header]].push(key);
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
      if (filename.includes("_Card")) {
        database.Sprites[name].Card = filename;
      } else if (filename.includes("_Banner")) {
        database.Sprites[name].Banner = filename;
      } else if (filename.includes("_Damaged")) {
        database.Sprites[name].Damaged = filename;
      } else {
        database.Sprites[name].Normal = filename;
      }
    } catch (e) {
      console.warn(`Failed to process sprite [${filename}]`);
    }
  });

  // Create a json file
  let databaseFile = path.join(databasePath, `${kanmusu.toLowerCase()}.json`);
  fs.writeFileSync(databaseFile, JSON.stringify(database));

  console.log(`[${kanmusu.toLowerCase()}.json] created`);
}

function runMakeFromNode() {
  var kanmusu = null;
  try {
    if (process.argv != null && process.argv.length > 1) {
      kanmusu = process.argv.slice(1).join(' ');
      kcdbMake(kanmusu, path.join(process.cwd(), 'public'), path.join(process.cwd(), 'src', 'database'));
    }
  } catch (e) {
    console.log("Unable to run maker from the following: ", process.argv, e);
    return;
  }
}

module.exports = {
  runMakeFromNode,
  kcdbMake
};