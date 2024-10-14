const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
  dayNames.forEach(dayName => {
    if (!confirmed) return
    const day = dayName.toLowerCase().substring(0, 3)
    let items = schedule[day]

    // TODO: find anything in the time slot,  remove if match, or alter if confirmed


    if (!document.getElementById(`rumbleroutine-${day}`).checked) {
      newSchedule[day] = items.filter(item => !(item.start == start && item.channel == channel))
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
  console.log('confirmed: ', confirmed)
  if (confirmed) {
    console.log(newSchedule)
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

// close the bar
function RubmleRoutineCloseBar () {
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

  const hours = document.createElement('select')
  hours.id = 'rumbleroutine-hours'
  Array.from({ length: 24 }, (_,i) => {
    const option = document.createElement('option')
    option.value = ('0' + i).slice(-2)
    option.label = i
    hours.appendChild(option)
  })
  hours.selectedIndex = dt.getHours()
  div.appendChild(hours)

  const colon = document.createElement(':')
  colon.innerHTML = ':'
  div.appendChild(colon)

  const minutes = document.createElement('select')
  minutes.id = 'rumbleroutine-minutes'
  Array.prototype.forEach.call(['00', '30'], val => {
    const option = document.createElement('option')
    option.value = val
    option.label = val
    minutes.appendChild(option)
  })
  div.appendChild(minutes)

  const sked = document.createElement('div')
  sked.className = 'inline-schedule'
  dayNames.forEach(day => {
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

  // const dd = dayNames[dt.getDay()].toLowerCase().substring(0, 3)
  // document.getElementById(`rumbleroutine-${dd}`).checked = true
}

async function RumbleRoutineUpdateChecked() {
  const hours = document.getElementById('rumbleroutine-hours').value
  const minutes = document.getElementById('rumbleroutine-minutes').value
  const start = `${hours}:${minutes}`
  console.log('start', start)

  const { channel } = RubmleRoutineGetChannel()
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })
  console.log('schedule', schedule)

  dayNames.forEach(dayName => {
    const d = dayName.toLowerCase().substring(0, 3)
    const present = schedule[d].find(item => item.channel == channel && item.start == start)
    console.log(d, present)
    if (present) {
      document.getElementById(`rumbleroutine-${d}`).checked = true
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

  if (message.type === 'open-settings') {
    return
  }
})
