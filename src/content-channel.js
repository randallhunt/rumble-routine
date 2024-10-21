function RubmleRoutineGetChannel () {
  // const channelEl = document.querySelector('[rel="author"]')
  const channelEl = document.querySelector('h1')
  if (!channelEl) return null
  const name = channelEl.innerHTML
  // const authorEl = channelEl.querySelector('h1')
  const path = window.location.pathname.split('/')
  const channel = path[2]

  return {
    name,
    channel
  }
}

function RumbleRoutineStartShow () {
  let container = document.querySelector('.videostream--featured .thumbnail__thumb--live')
  if (!container) {
    container = document.querySelector('.thumbnail__grid .thumbnail__thumb--live')
  }
  if (!container) {
    return
  }
  container.querySelector('a').click()
}

// RubmleRoutineDisplayBar()
