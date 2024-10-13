const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  // const response = await chrome.runtime.sendMessage({
  //   message: {
  //     author,
  //     channel,
  //     type: 'add-to-schedule'
  //   }
  // })
  const hours = document.getElementById('rumbleroutine-hours')
  const minutes = document.getElementById('rumbleroutine-minutes')
  const start = `${hours}:${minutes}`
  const { schedule } = await chrome.storage.sync.get({ 
    schedule: { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }
  })
  let confirmed = true
  days.forEach(d => {
    const day = d.toLowerCase()
    if (!document.getElementById(`rumbleroutine-${day}`).checked) return
    console.log('day', day)
    schedule[day].forEach(item => {
      console.log('item.start', item.start)
      if (item.start == start && item.channel != channel) {
        alert(`You already have ${channel} scheduled for ${day} at that time. Replace it?`)
      }
    })
  })
  // const existing = schedule.
  RubmleRoutineCloseBar()
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
  days.forEach(day => {
    const key = day.toLowerCase()
    const span = document.createElement('span')
    span.className = 'rumbleroutine-dayinput'
    span.innerHTML = `<input type="checkbox" id="rumbleroutine-${key}" value="${key}" /> <label for="rumbleroutine-${key}">${day}</label>`
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

  const dd = days[dt.getDay()].toLowerCase()
  document.getElementById(`rumbleroutine-${dd}`).checked = true
}

// inter-process messaging
chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  if (message.type === 'show-bar') {
    RubmleRoutineisplayBar()
    return
  }

  if (message.type === 'open-settings') {
    return
  }
})
