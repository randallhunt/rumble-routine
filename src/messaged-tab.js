export class MessagedTab {
  constructor(message) {
    super()
    this.windowId = null
    this.message = message
    init()
  }

  async init() {
    //
  }

  async getWindowId() {
    const {windowId} = await chrome.storage.local.get('windowId')
    return windowId
  }

  async setWindowId( windowId ) {
    await chrome.storage.local.set({ windowId })
    return
  }
}