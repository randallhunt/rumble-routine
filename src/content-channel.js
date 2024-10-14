function RubmleRoutineGetChannel () {
  // const channelEl = document.querySelector('[rel="author"]')
  const channelEl = document.querySelector('h1')
  if (!channelEl) return null
  const channel = channelEl.innerHTML
  // const authorEl = channelEl.querySelector('h1')
  const path = window.location.pathname.split('/')
  const name = path[2]

  return {
    name,
    channel
  }
}

RubmleRoutineDisplayBar()
