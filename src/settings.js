function log(text) {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL('icon1.jpg'),
    message: text,
    title: "Rumble Routine",
    type: "basic"
  })  
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ message: { type: 'settings-tab-ready' }})
})

window.addEventListener('unload', () => {
  chrome.storage.local.remove('settingsTabId')
})

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  log(`received message in settings: ${JSON.stringify(message)}`)
  // if (message == "hello") {
  //     chrome.tabs.create({ url: "https://www.rumble.com/" })
  // }
  //
  // document.getElementById('currentSource').append(message)
})

function deleteClick(e) {
  e.stopPropagation()
  e.preventDefault()
  const t = e.target
  const row = t.parentElement.parentElement
  const id = row.dataset['id']
  // console.log(id)
  // log(`delete ${id}`)
  row.parentElement.removeChild(row)
}

// const sched = [
//   {
//     id: 12345,
//     name: 'InfoWars',
//     creator: 'InfoWars',
//     start: new Date()
//   }
// ]

document.addEventListener('DOMContentLoaded', async () => {
  let {schedule} = await chrome.storage.sync.get({ schedule: [] })
  // log(JSON.stringify(schedule))
  
  const els = schedule.map(item => {

    const row = document.createElement('div')
    row.className = 'schedule-row'
    row.dataset.id = item.id

    const nameCell = document.createElement('div')
    nameCell.className = 'schedule-name'
    nameCell.innerHTML = item.name

    const creatorCell = document.createElement('div')
    creatorCell.className = 'schedule-creator'
    creatorCell.innerHTML = item.creator

    const startCell = document.createElement('div')
    startCell.className = 'schedule-date'
    startCell.innerHTML = item.start

    const actionsCell = document.createElement('div')
    const a = document.createElement('a')
    a.href = '#'
    a.innerHTML = 'X'
    a.addEventListener('click', deleteClick)
    actionsCell.appendChild(a)

    row.appendChild(nameCell)
    row.appendChild(creatorCell)
    row.appendChild(startCell)
    row.appendChild(actionsCell)
    return row
  })
  const scheduleTable = document.getElementById('scheduleTable')
  els.forEach(row => scheduleTable.appendChild(row))
}, false);
