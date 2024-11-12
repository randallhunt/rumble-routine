const RumbleRoutineDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

var RumbleRoutineMouseEl = null
var RumbleRoutineMouseStart = null
var RumbleRoutineStartVal = null

// time adding function
function RumbleRoutineTimeAdd(val, increment, pivot) {
  let vv = parseInt(val) + (increment % pivot)
  if (vv < 0) vv = parseInt(pivot) + vv
  return vv % pivot
}

// add to schedule
async function RubmleRoutineAddToSchedule () {
  const { name, channel } = RubmleRoutineGetChannel()
  const hours = document.getElementById('rumbleroutine-hours').value
  const minutes = document.getElementById('rumbleroutine-minutes').value
  const start = `${hours}:${minutes}`
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })
  let confirmed = true
  const newSchedule = { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  RumbleRoutineDayNames.forEach(dayName => {
    if (!confirmed) return
    const day = dayName.toLowerCase().substring(0, 3)
    let items = schedule[day].filter(item => !(item.start == start && item.channel == channel))

    // TODO: find anything in the time slot,  remove if match, or alter if confirmed


    if (!document.getElementById(`rumbleroutine-${day}`).checked) {
      newSchedule[day] = items //.filter(item => !(item.start == start && item.channel == channel))
      return
    }

    // iterate items for this day
    schedule[day].forEach(item => {
      if (!confirmed) return
      if (item.start == start && item.channel != channel) {
        if (!confirm(`You already have ${item.channel} scheduled for ${dayName} at that time. Replace it?`)) {
          confirmed = false
          return
        }
        items = items.filter(item => item.start !== start)
      }
    })
    if (confirmed) {
      items.push({
        id: new Date().valueOf(),
        name,
        channel,
        start
      })
    }
    newSchedule[day] = items
})
  if (confirmed) {
    chrome.storage.sync.set({ schedule: newSchedule })

    RubmleRoutineCloseBar()
    const response = await chrome.runtime.sendMessage({
      message: {
        name,
        channel,
        type: 'add-to-schedule'
      }
    })
  }
}

// mouse listeners
function RumbleRoutineMouseDown (e) {
  if (e.target.className !== 'rumble-routine-input') return
  RumbleRoutineMouseEl = e.target
  RumbleRoutineMouseStart = e.clientY
  RumbleRoutineStartVal = RumbleRoutineMouseEl.value
}
function RubmleRoutineMouseMove (e) {
  const el = RumbleRoutineMouseEl
  if (!el) return
  if (e.buttons == 0) return
  e.preventDefault()
  e.stopPropagation()
  const diff = RumbleRoutineMouseStart - e.clientY
  const increment = Math.floor(diff / 10)
  const newVal = RumbleRoutineTimeAdd(RumbleRoutineStartVal, increment, el.dataset.pivot)
  el.value = ('0' + newVal).slice(-2)
}
document.addEventListener('mousemove', RubmleRoutineMouseMove)
document.addEventListener('mouseup', () => { RumbleRoutineMouseEl = null})

// keypress listeners
function RumbleRoutineKeyDown(e) {
  const el = e.target
  const pivot = el.dataset.pivot
  e.preventDefault()
  e.stopPropagation()
  console.log(e.key, el.id)
  if (e.key == 'ArrowUp') {
    const num = RumbleRoutineTimeAdd(el.value, 1, pivot)
    el.value = ('0' + num).slice(-2)
  }
  if (e.key == 'ArrowDown') {
    const num = RumbleRoutineTimeAdd(el.value, -1, pivot)
    el.value = ('0' + num).slice(-2)
  }
  if (e.key == 'ArrowRight' && el.id == 'rumbleroutine-hours')
    document.getElementById('rumbleroutine-minutes').focus()
  if (e.key == 'ArrowLeft' && el.id == 'rumbleroutine-minutes')
    document.getElementById('rumbleroutine-hours').focus()
}

// close the bar
function RubmleRoutineCloseBar () {
  const hh = document.getElementById('rumbleroutine-hours')
  if (hh) {
    hh.removeEventListener('keypress', RumbleRoutineKeyDown)
    hh.removeEventListener('mousedown', RumbleRoutineMouseDown)
  }
  const mm = document.getElementById('rumbleroutine-minutes')
  if (mm) {
    mm.removeEventListener('keypress', RumbleRoutineKeyDown)
    mm.removeEventListener('mousedown', RumbleRoutineMouseDown)
  }
  const el = document.getElementById('rumble-routine-bar')
  if (el) el.parentElement.removeChild(el)
}

// display the bar
async function RubmleRoutineDisplayBar () {
  RubmleRoutineCloseBar()
  const dt = new Date()

  const el = document.createElement('div')
  el.id = 'rumble-routine-bar'

  const div = document.createElement('div')
  el.appendChild(div)

  const timeNudge = document.createElement('div')
  timeNudge.className = 'rumble-routine-time-nudge'

  const hours = document.createElement('input')
  hours.id = 'rumbleroutine-hours'
  hours.className = 'rumble-routine-input'
  hours.type = 'text'
  hours.size = 2
  hours.value = '00'
  hours.dataset.pivot = 24
  hours.addEventListener('mousedown', RumbleRoutineMouseDown)
  hours.addEventListener('keydown', RumbleRoutineKeyDown)
  hours.value = ('0' + dt.getHours()).slice(-2)
  timeNudge.appendChild(hours)

  const colon = document.createElement(':')
  colon.innerHTML = ':'
  timeNudge.appendChild(colon)

  const minutes = document.createElement('input')
  minutes.id = 'rumbleroutine-minutes'
  minutes.className = 'rumble-routine-input'
  minutes.type = 'text'
  minutes.size = 2
  minutes.value = '00'
  // minutes.value = ('0' + dt.getMinutes()).slice(-2)
  minutes.dataset.pivot = 60
  minutes.addEventListener('mousedown', RumbleRoutineMouseDown)
  minutes.addEventListener('keydown', RumbleRoutineKeyDown)
  timeNudge.appendChild(minutes)
  div.appendChild(timeNudge)

  const sked = document.createElement('div')
  sked.className = 'inline-schedule'
  RumbleRoutineDayNames.forEach(day => {
    const name = day.substring(0, 3)
    const key = name.toLowerCase()
    const span = document.createElement('span')
    span.className = 'rumbleroutine-dayinput'
    span.innerHTML = `<input type="checkbox" id="rumbleroutine-${key}" value="${key}" /> <label for="rumbleroutine-${key}">${name}</label>`
    sked.appendChild(span)
  })
  div.appendChild(sked)

  const button = document.createElement('button')
  button.innerHTML = 'Save'
  button.className = 'btn btn-green btn-sm media-subscribe'
  button.addEventListener('click', RubmleRoutineAddToSchedule)
  div.appendChild(button)

  const close = document.createElement('a')
  close.className = 'rumbleroutine-closebutton'
  close.href = '#'
  close.innerHTML = 'X'
  close.addEventListener('click', RubmleRoutineCloseBar)

  el.appendChild(close)
  document.body.appendChild(el)

  RumbleRoutineUpdateChecked()

  // const dd = RumbleRoutineDayNames[dt.getDay()].toLowerCase().substring(0, 3)
  // document.getElementById(`rumbleroutine-${dd}`).checked = true
}

async function RumbleRoutineUpdateChecked() {
  const hours = document.getElementById('rumbleroutine-hours').value
  const { channel } = RubmleRoutineGetChannel()
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })

  RumbleRoutineDayNames.forEach(dayName => {
    const d = dayName.toLowerCase().substring(0, 3)
    const startHH = document.getElementById('rumbleroutine-hours').value
    const present = schedule[d].find(item => item.channel == channel && startHH == hours)
    if (present) {
      const startMM = present.start.split(':')[1]
      document.getElementById(`rumbleroutine-${d}`).checked = true
      document.getElementById('rumbleroutine-minutes').value = ('0' + startMM).slice(-2)
    }
  })
}

// inter-process messaging
chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  if (message.type === 'show-bar') {
    RubmleRoutineDisplayBar()
    return
  }

  if (message.type == 'start-show') {
    RumbleRoutineStartShow?.()
  }

  if (message.type === 'open-settings') {
    return
  }
})

chrome.runtime.sendMessage({ message: { type: 'tab-ready' } })
