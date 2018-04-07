chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({'addedLinks': []}, function() {
    console.log('Dictionary initialized');
  });

  chrome.storage.sync.set({'token': 'null'}, function() {
    console.log('Token initialized');
  });
});