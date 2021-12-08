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
window.__combatModeLength = 1 * 60 * 1000; // In milliseconds
window.__mobileMode = {
  width: 600,
};
window.__minSize = {
  width: 300,
  height: 450,
};
window.__ship = "ship";

if (isDevelopment) {
  window.log = console.log.bind(window.console);
  window.logError = console.warn.bind(window.console);
} else {
  window.log = () => { };
  window.logError = () => { };
}

Number.prototype.pad = function (n) {
  try {
    let str = this.toString();
    return new Array(n + 1 - str.length).join('0') + str;
  } catch {
    return this;
  }
};