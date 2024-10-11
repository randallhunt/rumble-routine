chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  if (message == 'show-bar') {
    displayBar()
    return
  }

  if (message == "settings-opened") {
    const url = window.location
    if (
      url.pathname.slice(0, 3) === '/c/' ||
      url.pathname.slice(0, 2) === '/v'
    ) {
      const author = document.querySelector('[rel="author"]')
      const uid = author.href.split('/').pop()
      console.log(uid)
      // log(uid)
      // document.querySelector('.thumbnail__thumb--live')
      return
    }
  }
})

async function sendMessage() {
  const response = await chrome.runtime.sendMessage({ message: "hello" });
  // do something with response here, not outside the function
  console.log(response);
}


const author = document.querySelector('[rel="author"]')
console.log(author)
if (author) {
  const creatorEl = author.querySelector('.media-heading-name')
  const creator = creatorEl?.innerHTML.trim()
  console.log(`channel: ${creator}`)
  sendMessage()
  displayBar()
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
  el.innerHTML = `<div>
  Hello world
  <span class="rumbleroutine-close">X</span>
  </div>`
  el.style.position = 'fixed'
  el.style.top = '0px'
  el.style.width = '100vw'
  el.style.height = '40px'
  el.style.backgroundColor = '#ccc'
  el.style.color = '#000'
  el.style.zIndex = 10000

  const close = document.createElement('a')
  close.href = '#'
  close.innerHTML = 'X'
  close.addEventListener('click', closeBar)
  close.style.position = 'absolute'
  close.style.right = '5px'
  close.style.top = '5px'
  close.style.padding = '5px'
  close.style.border = 'solid 1px #000'
  el.appendChild(close)

  document.body.appendChild(el)
}
