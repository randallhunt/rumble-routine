function log(text) {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL('icon1.jpg'),
    message: text,
    title: "Rumble Routine",
    type: "basic"
  })  
}

chrome.action.onClicked.addListener(async () => {
  const tab = await getCurrentTab()
  if (!tab?.url) {
    setBadgeText('')
    return
  }
  const url = new URL(tab.url)

  const rumble = /rumble\.com/.test(url.hostname)
  log(rumble ? 'true' : 'false')
  if (!rumble) {
    if (
      url.pathname.slice(0, 3) === '/c/' ||
      url.pathname.slice(0, 2) === '/v'
    ) {
      const author = document.querySelector('[rel="author"]')
      const uid = author.href.split('/').pop()
      log(uid)
      // document.querySelector('.thumbnail__thumb--live')
      return
    }  
  }

  //
  chrome.tabs.create({ url: 'settings.html' }, (tab) => {
    log(`tab created ${tab.id}`)
  })
})

// await chrome.storage.sync.set({ options })
let options = {}

async function getOptions() {
  const options = await chrome.storage.sync.get('options')
  console.log('options', options)
}
getOptions()


// chrome.runtime.onInstalled.addListener(({reason}) => {
//   if (reason === 'install') {
//     chrome.tabs.create({
//       url: "onboarding.html"
//     });
//   }
// });

log('background script loaded')

// const options = await chrome.storage.sync.get('options')
// console.log('options', options)

// chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
//   const { message } = response
//   if (message == "hello") {
//       chrome.tabs.create({ url: "https://www.rumble.com/" })
//   }
// })

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
  // log("tab activated")
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
