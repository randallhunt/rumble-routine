

async function addCurrent () {
  const name = document.getElementById('current-name').value
  const channel = document.getElementById('current-channel').value
  const start = document.getElementById('current-start').value

  const sun = document.getElementById('current-sun')
  const mon = document.getElementById('current-mon')
  const tue = document.getElementById('current-tue')
  const wed = document.getElementById('current-wed')
  const thu = document.getElementById('current-thu')
  const fri = document.getElementById('current-fri')
  const sat = document.getElementById('current-sat')

  const days = [sun, mon, tue, wed, thu, fri, sat].reduce((prev, curr) => {
    if (curr.checked) return [...prev, curr.value]
    else return [...prev]
  }, [])

  // log(`days: ${days}`)

  const newItem = {
    id: (new Date()).valueOf(),
    name,
    channel,
    start,
    days
  }
  // log(`newitem: ${JSON.stringify(newItem)}`)

  const { schedule } = await chrome.storage.sync.get({ schedule: [] })
  schedule.push(newItem)
  await chrome.storage.sync.set({ schedule })
  const scheduleTable = document.getElementById('scheduleTable')
  scheduleTable.appendChild(makeRow(newItem))
  document.getElementById('current-source').reset()
}

async function deleteClick (e) {
  e.stopPropagation()
  e.preventDefault()
  const t = e.target
  const row = t.parentElement.parentElement.parentElement
  const id = parseInt(row.dataset.id)
  row.parentElement.removeChild(row)

  let { schedule } = await chrome.storage.sync.get({ schedule: [] })
  schedule = schedule.filter((item) => item.id !== id)
  await chrome.storage.sync.set({ schedule })
}

function makeRow (item) {
  const row = document.createElement('div')
  row.className = 'schedule-row'
  row.dataset.id = item.id

  const nameCell = document.createElement('div')
  nameCell.className = 'schedule-name'
  nameCell.innerHTML = item.name

  const creatorCell = document.createElement('div')
  creatorCell.className = 'schedule-creator'
  creatorCell.innerHTML = item.channel

  const startCell = document.createElement('div')
  startCell.className = 'schedule-start'
  startCell.innerHTML = item.start

  const daysCell = document.createElement('div')
  daysCell.className = 'schedule-days'
  daysCell.innerHTML = item.days.join(', ')

  const actionsCell = document.createElement('div')
  actionsCell.className = 'schedule-actions'
  const a = document.createElement('a')
  a.href = '#'
  a.innerHTML = '<i class="trash-icon"></i>'
  a.addEventListener('click', deleteClick)
  actionsCell.appendChild(a)

  row.appendChild(actionsCell)
  row.appendChild(nameCell)
  row.appendChild(creatorCell)
  row.appendChild(startCell)
  row.appendChild(daysCell)
  return row
}

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response

  if (message.type === 'add-to-schedule') {
    const name = document.getElementById('current-name')
    name.value = message.author

    const channel = document.getElementById('current-channel')
    channel.value = message.channel

    const start = document.getElementById('current-start')
    const now = new Date()
    start.value = `${now.getHours()}:${('00')}`
  }
})

document.getElementById('addbtn').addEventListener('click', addCurrent)

window.addEventListener('unload', () => {
  chrome.storage.local.remove('settingsTabId')
})

document.addEventListener('DOMContentLoaded', async () => {
  const { schedule } = await chrome.storage.sync.get({ schedule: [] })

  const els = schedule.map(makeRow)
  const scheduleTable = document.getElementById('scheduleTable')
  scheduleTable.innerHTML = `
  <div class="schedule-row">
    <div class="heading schedule-actions"></div>
    <div class="heading schedule-name">Name</div>
    <div class="heading schedule-creator">Creator</div>
    <div class="heading schedule-start">Time</div>
    <div class="heading schedule-days">Days</div>
  </div>
  `
  els.forEach(row => scheduleTable.appendChild(row))

  chrome.runtime.sendMessage({ message: { type: 'settings-tab-ready' } })
}, false)
