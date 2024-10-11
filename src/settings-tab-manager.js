export class SettingsTabManager {
  constructor(url, storageName = 'settingsTabId') {
    super()
    this.url = url
    this.setting = storageName
    this.message = null
    this.ready = true
    this.waitCount = 0
    this.windowId = null

    chrome.webNavigation.onDOMContentLoaded.addListener(this.domReady)
    // async (tabId, url) => {
    //   const setting = await chrome.storage.local.get(this.setting)
    //   const storedTabId = setting[this.setting]
    //   if (tabId !== storedTabId) return
    //   if (url !== this.url) return
    //   chrome.tabs.sendMessage(tabId, this.message)
    //   this.message = null
    //   this.ready = true
    //   this.waitCount = 0
    // })
  }

  domReady = async (tabId, url) => {
    const setting = await chrome.storage.local.get(this.setting)
    const storedTabId = setting[this.setting]
    if (tabId !== storedTabId) return
    if (url !== this.url) return
    chrome.tabs.sendMessage(tabId, this.message)
    this.message = null
    this.ready = true
    this.waitCount = 0
  }

  waitForTab = () => {
    this.timer = setTimeout(() => {
      if (this.ready) {
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
      tab = createTab()
    }
    if (!message) {
      this.timer = null
      return
    }
    this.ready = false
    this.waitCount = 0
    thisl.waitForTab()
  }

  createTab = async () => {
    const tab = chrome.tabs.create({url: this.url})
    await chrome.storage.local.set({[this.setting]: tab.id})
    return tab
  }

  getOpenTab = async () => {
    const {tabId} = await chrome.storage.local.get(this.setting)
    if (!tabId) return null
    const tab = await chrome.tabs.get(tabId)
    if (tab.url == this.url) {
      chrome.tabs.highlight({ tabs: tab.id })
      return tab
    }
    return null
  }
}