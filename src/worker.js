// await chrome.storage.sync.set({ options })

async function getOptions() {
  const options = await chrome.storage.sync.get('options')
  console.log('options', options)
}
getOptions()
