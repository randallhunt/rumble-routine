chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  const { message } = response
  if (message == "settings-opened") {
    const url = window.location
    if (
      url.pathname.slice(0, 3) === '/c/' ||
      url.pathname.slice(0, 2) === '/v'
    ) {
      const author = document.querySelector('[rel="author"]')
      const uid = author.href.split('/').pop()
      console.log(uid)
      // log(uid)
      // document.querySelector('.thumbnail__thumb--live')
      return
    }
  
  }
  // if (message == "hello") {
  //     chrome.tabs.create({ url: "https://www.rumble.com/" })
  // }
  // document.getElementById('currentSource').append(message)
})

document.addEventListener('DOMContentLoaded', () => {
  const author = document.querySelector('[rel="author"]')

  // var checkPageButton = document.getElementById('clickIt');
  // checkPageButton.addEventListener('click', function() {

  //   chrome.tabs.getSelected(null, function(tab) {
  //     alert("Hello..! It's my first chrome extension.");
  //   });
  // }, false);
}, false);
