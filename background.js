if (typeof chrome !== undefined) {
  runBackgroundScript(chrome)
} else {
  runBackgroundScript(browser)
}

function runBackgroundScript(browser) {
  try {
    browser.contextMenus.create({
      title: 'Open in Todorant',
      id: 'todorant-context',
      contexts: ['link', 'selection', 'editable', 'page_action'],
    })
  } catch (_) {
    // Do nothing
  }
  browser.contextMenus.onClicked.addListener((info, tab) => {
    let text = ''
    if (info.selectionText) {
      text = info.selectionText
    } else {
      text = info.linkUrl
    }
    browser.tabs.create({
      url: `https://todorant.com/superpower?extension=${text}`,
    })
  })
}
