chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  // if (message == "hello") {
  //     chrome.tabs.create({ url: "https://www.rumble.com/" })
  // }
  document.getElementById('currentSource').append(message)
})

const sched = [
  {
    name: 'InfoWars',
    creator: 'InfoWars',
    start: new Date()
  }
]
document.addEventListener('DOMContentLoaded', function() {
  const els = sched.map(item => {
    const row = document.createElement('tr')
    const nameCell = document.createElement('td')
    nameCell.innerHTML = item.name
    const creatorCell = document.createElement('td')
    creatorCell.innerHTML = item.creator
    const startCell = document.createElement('td')
    startCell.innerHTML = item.start
    row.appendChild(nameCell)
    row.appendChild(creatorCell)
    row.appendChild(startCell)
    return row
  })
  const scheduleBody = document.getElementById('scheduleBody')
  els.forEach(row => scheduleBody.appendChild(row))
}, false);

document.getElementById('tabNum').innerHTML = 'hello'
