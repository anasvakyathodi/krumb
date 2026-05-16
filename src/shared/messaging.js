// Krumb — message routing helpers shared by popup / options / content / sw.

export const MSG = Object.freeze({
  GET_STATUS:           'krumb:getStatus',
  TOGGLE_PAUSED:        'krumb:togglePaused',
  TOGGLE_SITE:          'krumb:toggleSite',
  REQUEST_RULES_UPDATE: 'krumb:requestRulesUpdate',
  OPEN_PICKER:          'krumb:openPicker',
  PICKER_RESULT:        'krumb:pickerResult',
  CONTENT_REPORT:       'krumb:contentReport',
  SETTINGS_CHANGED:     'krumb:settingsChanged',
  RESET_TAB:            'krumb:resetTab',
});

export function send(type, payload = {}) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage({ type, ...payload }, response => {
        // Swallow "Could not establish connection" when no receiver.
        if (chrome.runtime.lastError) return resolve(null);
        resolve(response);
      });
    } catch { resolve(null); }
  });
}

export function sendToTab(tabId, type, payload = {}) {
  return new Promise(resolve => {
    try {
      chrome.tabs.sendMessage(tabId, { type, ...payload }, response => {
        if (chrome.runtime.lastError) return resolve(null);
        resolve(response);
      });
    } catch { resolve(null); }
  });
}
