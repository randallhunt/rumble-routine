function RubmleRoutineGetChannel () {
  const channelEl = document.querySelector('[rel="author"]')
  if (!channelEl) return null
  const channel = channelEl.href.split('/').pop()
  const authorEl = channelEl.querySelector('.media-heading-name')
  const name = authorEl?.innerHTML.trim()

  return {
    name,
    channel
  }
}

// RubmleRoutineDisplayBar()
