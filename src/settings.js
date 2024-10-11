function log(text) {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL('icon1.jpg'),
    message: text,
    title: "Rumble Routine",
    type: "basic"
  })  
}

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  // if (message == "hello") {
  //     chrome.tabs.create({ url: "https://www.rumble.com/" })
  // }
  document.getElementById('currentSource').append(message)
})

function deleteClick(e) {
  e.stopPropagation()
  e.preventDefault()
  const t = e.target
  const row = t.parentElement.parentElement
  const id = row.dataset['id']
  console.log(id)
  log(`delete ${id}`)
}

const sched = [
  {
    id: 12345,
    name: 'InfoWars',
    creator: 'InfoWars',
    start: new Date()
  }
]

document.addEventListener('DOMContentLoaded', function() {
  const els = sched.map(item => {
    const row = document.createElement('div')
    row.className = 'schedule-row'
    row.dataset.id = item.id
    const nameCell = document.createElement('div')
    nameCell.className = 'schedule-name'
    nameCell.innerHTML = item.name
    const creatorCell = document.createElement('div')
    creatorCell.className = 'schedule-creator'
    creatorCell.innerHTML = item.creator
    const startCell = document.createElement('div')
    startCell.className = 'schedule-date'
    startCell.innerHTML = item.start
    const actionsCell = document.createElement('div')
    const a = document.createElement('a')
    a.href = '#'
    a.innerHTML = 'X'
    a.addEventListener('click', deleteClick)
    actionsCell.appendChild(a)
    row.appendChild(nameCell)
    row.appendChild(creatorCell)
    row.appendChild(startCell)
    row.appendChild(actionsCell)
    return row
  })
  const scheduleTable = document.getElementById('scheduleTable')
  els.forEach(row => scheduleTable.appendChild(row))
}, false);
