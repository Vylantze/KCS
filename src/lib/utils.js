const fs = require('fs');


function deleteAllRecursive(dirpath) {
  if (fs.existsSync(dirpath)) {
    /* Old unneeded code
    fs.readdirSync(dirpath).forEach(file => {
      var curPath = path.join(dirpath, file);
      try {
        if (fs.lstatSync(curPath).isDirectory()) deleteAllRecursive(curPath);
        else fs.unlinkSync(curPath);
      } catch (e) {
        console.warn(e);
      }
    });
    //*/
    fs.rmdirSync(dirpath, {
      recursive: true,
    });
  }
}

function saveSetting(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadSetting(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

module.exports = {
  deleteAllRecursive,
  loadSetting,
  saveSetting,
};