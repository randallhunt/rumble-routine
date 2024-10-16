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
      if (message.type === 'tab-ready') this.ready = true
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
    this.tabId = tab.id
    return tab
  }
    
  waitForTab = () => {
    this.timer = setTimeout(() => {
      if (this.ready) {
        chrome.tabs.sendMessage(this.tabId, { message: this.message })
        return
      }
      if (this.waitCount < 50) {
        this.waitCount++
        this.waitForTab()
        return
      }
      throw new Error('failed to open settings tab')
    }, 100)
  }

  openTab = async ({url = this.url, message = null, focus = true}) => {
    this.message = message
    const tab = await this.getReusableTab()
    this.tabId = tab.id
    const updateProperties = {
      url
    }
    if (focus) {
      updateProperties.active = true
    }
    chrome.tabs.update(this.tabId, updateProperties)
    if (!message) {
      this.timer = null
      return
    }
    this.ready = false
    this.waitCount = 0
    this.waitForTab()
  }
}
