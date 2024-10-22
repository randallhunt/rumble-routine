/*eslint no-unused-vars: "off" */

// log() was used for debugging, but is no longer needed
// function log (text) {
//   chrome.notifications.create({
//     iconUrl: chrome.runtime.getURL('icon1.jpg'),
//     message: text,
//     title: 'Rumble Routine',
//     type: 'basic'
//   })
// }

function isRumble (url) {
  return /rumble\.com/.test(url.hostname)
}

function isChannel (url) {
  return url.pathname.slice(0, 3) === '/c/'
}

function isVideo (url) {
  return url.pathname.slice(0, 2) === '/v'
}
