import { SettingsTabManager } from "./settings-tab-manager"

const settingsManager = new SettingsTabManager('./settings.html')

function log(text) {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL('icon1.jpg'),
    message: text,
    title: "Rumble Routine",
    type: "basic"
  })  
}

chrome.runtime.onInstalled.addListener(async ({reason}) => {
  let { options } = await chrome.storage.sync.get({ options: {} })
  if (!options) {
    options = {}
    await chrome.storage.sync.set({ options })
  }

  let { schedule } = await chrome.storage.sync.get({ schedule: [{
      id: 12345,
      name: 'InfoWars',
      creator: 'InfoWars',
      start: new Date().valueOf()
    }]
  })
  // if (!schedule) {
  //   options.schedule = [{
  //     id: 12345,
  //     name: 'InfoWars',
  //     creator: 'InfoWars',
  //     start: new Date()
  //   }]
  // }
  await chrome.storage.sync.set({ schedule })

  if (reason == 'install') {
    // add options object, maybe?
  }
  // if (reason == 'install' || 'update' )
  // log(`Installed - ${reason}`)
})

chrome.action.onClicked.addListener(async () => {
  const tab = await getCurrentTab()
  // if (!tab?.url) {
  //   setBadgeText('')
  //   return
  // }
  const {hostname, pathname} = new URL(tab.url)

  const rumble = /rumble\.com/.test(hostname)
  // log(rumble ? 'true' : 'false')
  if (rumble) {
  //   if (
  //     pathname.slice(0, 3) === '/c/' ||
  //     pathname.slice(0, 2) === '/v'
  //   ) {
  //     const author = document.querySelector('[rel="author"]')
  //     const uid = author.href.split('/').pop()
  //     // log(uid)
  //     // document.querySelector('.thumbnail__thumb--live')

  //   }
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { message: { type: "show-bar" } });
    return
  }

  //
  chrome.tabs.create({ url: 'settings.html' }, (tab) => {
    // log(`tab created ${tab.id}`)
  })
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    const {message} = request
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (message.type == 'add-to-schedule') {
      const data = JSON.stringify(message)
      log(data)
      // log(`add ${message.channel} to schedule`)

      chrome.tabs.create({ url: 'settings.html' }, async (tab) => {
        const response = await chrome.tabs.sendMessage(tab.id, message)
        // log(`tab created ${tab.id}`)
      })
    
    }
    // if (request.message.type === "hello")
    //   sendResponse({farewell: "goodbye"});
  }
);

// await chrome.storage.sync.set({ options })
// let options = {}

// async function getOptions() {
//   const options = await chrome.storage.sync.get('options')
//   console.log('options', options)
// }
// getOptions()

chrome.action.iconUrl = chrome.runtime.getURL('icon.svg')

// log('background script loaded')

async function setBadgeText(text) {
  await chrome.action.setBadgeText({ text })
}

async function updateAction() {
  const tab = await getCurrentTab()
  if (!tab?.url) {
    setBadgeText('')
    return
  }
  const url = new URL(tab.url)

  const rumble = /rumble\.com/.test(url.hostname)
  if (url.pathname.slice(0, 3) === '/c/') {
    setBadgeText('user')
    // document.querySelector('[rel="author"]')
    // document.querySelector('.thumbnail__thumb--live')
    return
  }
  if (url.pathname.slice(0, 2) === '/v') {
    setBadgeText('vid')
    // document.querySelector('[rel="author"]')
    return
  }
  // if (!rumble)
    setBadgeText('')
  // setBadgeText(rumble)
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.tabs.onActivated.addListener((tabInfo) => {
  // const { tabId, windowId } = tabInfo
  updateAction()
})

chrome.windows.onFocusChanged.addListener(() => {
  updateAction()
})

chrome.tabs.onCreated.addListener(() => {
  updateAction()
})

chrome.tabs.onUpdated.addListener(() => {
  updateAction()
})

chrome.webNavigation.onDOMContentLoaded.addListener(async ({ tabId, url }) => {
  const { hostname } = new URL(url)
  if (!/rumble\.com/.test(hostname)) return
  // log('on Rumble')
  // if (url.pathname.slice(0, 3) === '/c/') {
  //   setBadgeText('user')
  //   // document.querySelector('[rel="author"]')
  //   // document.querySelector('.thumbnail__thumb--live')
  //   return
  // }
  // if (url.pathname.slice(0, 2) === '/v') {
  //   setBadgeText('vid')
  //   // document.querySelector('[rel="author"]')
  //   return
  // }

  // const { options } = await chrome.storage.local.get('options');
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js'],
    // ...options
  });
});