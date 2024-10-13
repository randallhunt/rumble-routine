// const dayAbbr = d => d.toLowerCase().substring(0, 3)
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// const days = dayNames.map(dayAbbr)
// const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// get channel info
function RubmleRoutineGetChannel () {
  const channelEl = document.querySelector('[rel="author"]')
  if (!channelEl) return null
  const channel = channelEl.href.split('/').pop()
  const authorEl = channelEl.querySelector('.media-heading-name')
  const author = authorEl?.innerHTML.trim()

  return {
    author,
    channel
  }
}

// add to schedule
async function RubmleRoutineAddToSchedule () {
  const { author, channel } = RubmleRoutineGetChannel()
  const hours = document.getElementById('rumbleroutine-hours').value
  const minutes = document.getElementById('rumbleroutine-minutes').value
  const start = `${hours}:${minutes}`
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })
  let confirmed = true
  const newSchedule = { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  dayNames.forEach(dayName => {
    const day = dayName.toLowerCase().substring(0, 3)
    let items = schedule[day]
    if (!document.getElementById(`rumbleroutine-${day}`).checked) {
      newSchedule[day] = items.filter(item => item.start !== start && item.channel !== channel)
      return
    }
    schedule[day].forEach(item => {
      if (item.start == start && item.channel != channel) {
        if (!confirm(`You already have ${item.channel} scheduled for ${dayName} at that time. Replace it?`)) {
          confirmed = false
          return
        }
        items.filter(item => item.start !== start)
      }
      items.push({
        id: new Date().valueOf(),
        author,
        channel,
        start
      })
      newSchedule[day] = items
    })
    console.log('confirmed: ', confirmed)
    if (confirmed) {
      console.log(newSchedule)
      chrome.storage.sync.set({ schedule: newSchedule })
    }
  })
  RubmleRoutineCloseBar()
  const response = await chrome.runtime.sendMessage({
    message: {
      author,
      channel,
      type: 'add-to-schedule'
    }
  })
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
    option.value = i
    option.label = ('0' + i).slice(-2)
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

  const dd = dayNames[dt.getDay()].toLowerCase().substring(0, 3)
  document.getElementById(`rumbleroutine-${dd}`).checked = true
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
