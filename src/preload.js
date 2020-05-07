const path = require('path');
const fs = require('fs');
const electron = require('electron');

console.log("Loaded preload");
window.lib = {
  fs,
  path,
  win: electron.remote.getCurrentWindow(),
};