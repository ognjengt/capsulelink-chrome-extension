chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({'addedLinks': []}, function() {
    console.log('Dictionary initialized');
  });
});