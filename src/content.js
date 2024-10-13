const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getChannel () {
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

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  if (message.type === 'show-bar') {
    displayBar()
    return
  }

  if (message.type === 'open-settings') {
    return
  }

  // if (message == "settings-opened") {
  //   const url = window.location
  //   if (
  //     url.pathname.slice(0, 3) === '/c/' ||
  //     url.pathname.slice(0, 2) === '/v'
  //   ) {
  //     const author = document.querySelector('[rel="author"]')
  //     const uid = author.href.split('/').pop()
  //     console.log(uid)
  //     // log(uid)
  //     // document.querySelector('.thumbnail__thumb--live')
  //     return
  //   }
  // }
})

// async function sendMessage () {
//   // const response = await chrome.runtime.sendMessage({ message: { type: "hello" } });
//   // do something with response here, not outside the function
//   // console.log(response);
// }

const creator = getChannel()
if (creator) {
  displayBar()
}

async function addToSchedule () {
  const { author, channel } = getChannel()
  const response = await chrome.runtime.sendMessage({
    message: {
      author,
      channel,
      type: 'add-to-schedule'
    }
  })
  closeBar()
}

function closeBar () {
  const el = document.getElementById('rumble-routine-bar')
  if (el) el.parentElement.removeChild(el)
}

async function displayBar () {
  // let el = document.getElementById('rumble-routine-bar')
  // if (el) el.parentElement.removeChild(el)
  closeBar()
  const el = document.createElement('div')
  el.id = 'rumble-routine-bar'

  const div = document.createElement('div')
  // div.innerHTML = 'This program is not in your schedule'
  // div.style.textShadow = '1px 1px 2px white'
  el.appendChild(div)

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
  button.innerHTML = 'Add It'
  button.className = 'btn btn-green btn-sm media-subscribe'
  button.addEventListener('click', addToSchedule)
  div.appendChild(button)

  const close = document.createElement('a')
  close.className = 'rumbleroutine-closebutton'
  close.href = '#'
  close.innerHTML = 'X'
  close.addEventListener('click', closeBar)

  el.appendChild(close)
  document.body.appendChild(el)
}
