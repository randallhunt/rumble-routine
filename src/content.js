function getChannel() {
  const channelEl = document.querySelector('[rel="author"]')
  if (!channelEl) return null
  const channel = channelEl.href.split('/').pop()
  const author = channelEl.querySelector('.media-heading-name').innerHTML.trim()
  // const authorEl = document.querySelector('.thumbnail__thumb--live')

  return {
    author,
    channel
  }
}

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  if (message.type == 'show-bar') {
    displayBar()
    return
  }

  if (message.type == 'open-settings') {
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

async function sendMessage() {
  // const response = await chrome.runtime.sendMessage({ message: { type: "hello" } });
  // do something with response here, not outside the function
  // console.log(response);
}

const creator = getChannel()
if (creator) {
  // const creatorEl = author.querySelector('.media-heading-name')
  // const creator = creatorEl?.innerHTML.trim()
  console.log(`author: ${creator.author}`)
  console.log(`channel: ${creator.channel}`)
  // sendMessage()
  displayBar()
}
// const author = document.querySelector('[rel="author"]')
// console.log(author)
// if (author) {
// }

async function addToSchedule() {
  const { author, channel } = getChannel()
  const response = await chrome.runtime.sendMessage({ message: {
    author,
    channel,
    type: 'add-to-schedule'
  } });
  closeBar()
}

function closeBar() {
  let el = document.getElementById('rumbleroutine')
  if (el) el.parentElement.removeChild(el)
}

async function displayBar() {
  // let el = document.getElementById('rumbleroutine')
  // if (el) el.parentElement.removeChild(el)
  closeBar()
  el = document.createElement('div')
  el.id = 'rumbleroutine'

  const div = document.createElement('div')
  div.innerHTML = 'This program is not in your schedule'
  div.style.textShadow = '1px 1px 2px white'
  el.appendChild(div)

  const button = document.createElement('button')
  button.innerHTML = 'Add It'
  button.className = 'btn btn-green btn-sm media-subscribe'
  button.addEventListener('click', addToSchedule)
  // button.style.backgroundColor = '#85c742'
  // button.style.borderRadius = '4px'
  button.style.display = 'inline'
  button.style.margin = '0 5px'
  button.style.whiteSpace = 'no-wrap'
  div.appendChild(button)

  el.style.background = 'linear-gradient(0.25turn, rgb(81,184,89), rgb(190,232,193), rgb(81,184,89))'
  el.style.boxSizing = 'border-box'
  el.style.color = '#000'
  el.style.fontSize = '16px'
  // el.style.height = '40px'
  el.style.margin = '0'
  el.style.padding = '.6em 1em'
  el.style.position = 'fixed'
  el.style.textAlign = 'center'
  el.style.top = '0px'
  el.style.width = '100vw'
  el.style.zIndex = 10000

  const close = document.createElement('a')
  close.href = '#'
  close.innerHTML = 'X'
  close.addEventListener('click', closeBar)
  close.style.backgroundColor = '#fff'
  close.style.border = 'solid 1px #000'
  close.style.display = 'inline-block'
  close.style.fontWeight = 'bold'
  close.style.lineHeight = '20px'
  close.style.position = 'absolute'
  close.style.right = '5px'
  close.style.top = '5px'
  close.style.width = '20px'
  el.appendChild(close)

  document.body.appendChild(el)
}
