const dayAbbr = d => d.toLowerCase().substring(0, 3)
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const days = dayNames.map(dayAbbr)

async function addCurrent () {
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: []
    }
  })

  const name = document.getElementById('current-name').value
  const channel = document.getElementById('current-channel').value
  const start = document.getElementById('current-start').value

  const newItem = {
    id: (new Date()).valueOf(),
    name,
    channel,
    start,
  }

  days.forEach((day) => {
    let sked = [...schedule[day]]

    // find that item
    const idx = sked.find(item => {
      return (item.channel == channel && item.start == start)
    })

    const input = document.getElementById(`current-${day}`)
    if (input.checked) {
      if (idx > -1) {
        sked[idx] = newItem
      } else {
        sked.push(newItem)
      }
    } else {
      if (idx > -1) {
        sked = schedule[day].filter((_item, index) => index != idx)
      }
    }
    schedule[day] = sked
  })

  const days = [sun, mon, tue, wed, thu, fri, sat].reduce((prev, curr) => {
    if (curr.checked) return [...prev, curr.value]
    else return [...prev]
  }, [])

  await chrome.storage.sync.set({ schedule })
}

async function deleteClick (e) {
  e.stopPropagation()
  e.preventDefault()
  const t = e.target
  const row = t.parentElement.parentElement.parentElement
  const table = row.parentElement
  const id = parseInt(row.dataset.id)
  const day = table.dataset.day
  table.removeChild(row)

  let { schedule } = await chrome.storage.sync.get({ schedule: [] })
  schedule[day] = schedule[day].filter((item) => item.id !== id)
  await chrome.storage.sync.set({ schedule })
}

function makeRow (item) {
  const row = document.createElement('div')
  row.className = 'schedule-row'
  row.dataset.id = item.id

  const startCell = document.createElement('div')
  startCell.className = 'schedule-start'
  startCell.innerHTML = item.start

  const nameCell = document.createElement('div')
  nameCell.className = 'schedule-name'
  nameCell.innerHTML = item.name

  const channelCell = document.createElement('div')
  channelCell.className = 'schedule-channel'
  channelCell.innerHTML = item.channel

  const actionsCell = document.createElement('div')
  actionsCell.className = 'schedule-actions'
  const a = document.createElement('a')
  a.href = '#'
  a.innerHTML = '<i class="trash-icon"></i>'
  a.addEventListener('click', deleteClick)
  actionsCell.appendChild(a)

  row.appendChild(actionsCell)
  row.appendChild(startCell)
  row.appendChild(nameCell)
  row.appendChild(channelCell)
  return row
}

async function redraw() {
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })

  days.forEach((day, i) => {
    const table = document.getElementById(`${day}-schedule`)
    table.innerHTML = `<h2>${dayNames[i]}</h2>`
    const sked = schedule[day].sort((a, b) => {
      return a.start.localeCompare(b.start)
    })
    sked.forEach(item => {
      table.appendChild(makeRow(item))
    })
  })
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
  await redraw()

  chrome.runtime.sendMessage({ message: { type: 'settings-tab-ready' } })
}, false)
