class SettingsTabManager {
  constructor(url, storageName = 'settingsTabId') {
    this.url = url
    this.setting = storageName
    this.message = null
    this.ready = true
    this.tabId = null
    this.waitCount = 0
    this.windowId = null

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const {message} = request
      if (message.type === 'settings-tab-ready') this.ready = true
    })
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
      throw new Error("failed to open settings tab");
    }, 50);
  }

  openSettingsTab = async (message = null) => {
    this.message = message
    let tab = await this.getOpenTab()
    if (!tab) {
      tab = this.createTab()
    }
    if (!message) {
      this.timer = null
      return
    }
    this.ready = false
    this.waitCount = 0
    this.waitForTab()
  }

  createTab = async () => {
    const tab = await chrome.tabs.create({url: this.url})
    await chrome.storage.local.set({[this.setting]: tab.id})
    this.tabId = tab.id
    return tab
  }

  getOpenTab = async () => {
    const {tabId} = await chrome.storage.local.get(this.setting)
    if (!tabId) return null
    const tab = await chrome.tabs.get(tabId)
    if (tab.url == this.url) {
      chrome.tabs.highlight({ tabs: tab.id })
      this.tabId = tab.id
      return tab
    }
    return null
  }
}