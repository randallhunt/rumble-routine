importScripts('./managed-tab.js', './utils.js')

const settingsManager = new ManagedTab('./settings/page.html', 'settingsTab')
const currentStream = new ManagedTab('https://rumble.com', 'streamingTab')

const WeeklyIntervalInMinutes = 10080 // 7*24*60


// async function getReusableTab () {
//   const { rumbleTab } = chrome.storage.sync.get('rumbleTab')
//   let tab
//   if (rumbleTab) {
//     tab = await chrome.tabs.get(rumbleTab)
//     const url = new URL(tab.url)
//     if (!/rumble.com/.test(url.hostname.match))
//       tab = null
//   }
//   if (!tab) {
//     tab = await chrome.tabs.create({})
//   }
//   chrome.storage.sync.set({ rumbleTab: tab.id })
//   return tab
// }

// get the next day by name
Date.prototype.next = function (dayName) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let target = names.map(d => d.toLowerCase().substring(0, dayName.length)).indexOf(dayName.toLowerCase())
  if (target == -1) throw new Error("bad day name specified")
  const today = new Date(this.valueOf())
  let current = today.getDay() + 1
  let add = 1
  while (current != target) {
    add += 1
    current = (current + 1) % 7
  }
  today.setDate(today.getDate() + add)
  return today
}

async function startAlarms () {
  await chrome.alarms.clearAll()
  const { schedule } = await chrome.storage.sync.get({
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })
  const now = new Date()
  Array.prototype.forEach.call(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], (dayOfWeek, dayIndex) => {
    Array.prototype.forEach.call(schedule[dayOfWeek],  (item) => {
      const {start, channel} = item
      const [hours, minutes] = start.split(':')
      let alarmDate = new Date()
      alarmDate.setHours(+hours)
      alarmDate.setMinutes(+minutes)
      alarmDate.setSeconds(59)
      if ((dayIndex != now.getDay()) || (alarmDate.getHours() < now.getHours())) {
        alarmDate = alarmDate.next(dayOfWeek)
      }
      chrome.alarms.create(`${dayOfWeek},${start},${channel}`, {
        periodInMinutes: WeeklyIntervalInMinutes,
        when: alarmDate.valueOf()
      })
    })
  })
}

chrome.alarms.onAlarm.addListener(async alarm => {
  const { schedule } = await chrome.storage.sync.get({
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })
  const [day, start, channel] = alarm.name.split(',')
  Array.prototype.forEach.call(schedule[day], async (item) => {
    if (item.channel == channel && item.start == start) {
      currentStream.openUrl(`https://rumble.com/c/${item.channel}`)
      // const tab = getReusableTab()
      // chrome.tabs.update(tab.id, {url: `https://rumble.com/c/${item.channel}` })
    }
  })
})

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  let { options } = await chrome.storage.sync.get({ options: {} })
  if (!options) {
    options = {}
    await chrome.storage.sync.set({ options })
  }

  if (reason === 'install') {
    const { schedule } = await chrome.storage.sync.get({
      schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
    })
    await chrome.storage.sync.set({ schedule })

  }
  startAlarms()
  // if (reason == 'install' || 'update' )
  // log(`Installed - ${reason}`)
})

chrome.action.onClicked.addListener(async () => {
  const tab = await getCurrentTab()
  // if (!tab?.url) {
  //   setBadgeText('')
  //   return
  // }
  const { hostname, pathname } = new URL(tab.url)

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
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    const response = await chrome.tabs.sendMessage(tab.id, { message: { type: 'show-bar' } })
    console.log('response', response)
    return
  }

  settingsManager.openTab()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { message } = request
  // console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension')
  if (message.type === 'add-to-schedule') {
    const data = JSON.stringify(message)
    // log(data)
    // log(`add ${message.channel} to schedule`)

    settingsManager.openTab(message)
    // chrome.tabs.create({ url: 'settings/page.html' }, async (tab) => {
    //   const response = await chrome.tabs.sendMessage(tab.id, message)
    //   // log(`tab created ${tab.id}`)
    // })
  }
  // if (request.message.type === "hello")
  //   sendResponse({farewell: "goodbye"});
})

chrome.action.iconUrl = chrome.runtime.getURL('icon.svg')

async function setBadgeText (text) {
  await chrome.action.setBadgeText({ text })
}

async function updateAction () {
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

async function getCurrentTab () {
  const queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
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

  // chrome.scripting.executeScript({
  //   target: { tabId },
  //   files: ['content.js']
  //   // ...options
  // })

})
