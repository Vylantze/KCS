export function saveSetting(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadSetting(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (error) {
    window.logError('[loadSetting] Error', error);
    return null;
  }
}

export default { loadSetting, saveSetting };
