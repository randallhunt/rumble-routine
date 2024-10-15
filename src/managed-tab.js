class ManagedTab {
  constructor (url, storageName) {
    this.url = url
    this.setting = storageName
    this.message = null
    this.ready = true
    this.tabId = null
    this.waitCount = 0
    this.windowId = null

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const { message } = request
      // TODO: configurable message type
      if (message.type === 'settings-tab-ready') this.ready = true
    })
  }

  getReusableTab = async () => {
    const setting = await chrome.storage.local.get(this.setting)
    const tabId = setting[this.setting]
    let tab
    if (tabId) {
      try {
        tab = await chrome.tabs.get(tabId)
        if (tab.url.indexOf(this.url) == -1)
          tab = null          
      } catch (error) {
        tab = null
      }
    }
    if (!tab) {
      tab = await chrome.tabs.create({})
    }
    chrome.storage.local.set({ [this.setting]: tab.id })
    return tab
  }
    
  waitForTab = () => {
    this.timer = setTimeout(() => {
      if (this.ready) {
        chrome.tabs.sendMessage(this.tabId, { message: this.message })
        return
      }
      if (this.waitCount < 10) {
        this.waitCount++
        this.waitForTab()
        return
      }
      throw new Error('failed to open settings tab')
    }, 50)
  }

  openTab = async ({url = this.url, message = null}) => {
    this.message = message
    const tab = await this.getReusableTab()
    chrome.tabs.update(tab.id, { url })
    if (!message) {
      this.timer = null
      return
    }
    this.ready = false
    this.waitCount = 0
    this.waitForTab()
  }

  openUrl = async (url) => {
    let tab = await this.getReusableTab()
    await chrome.tabs.update(tab.id, { url })
  }
}
