document.addEventListener('DOMContentLoaded', function() {
  const fontSelect = document.getElementById('fontSelect');
  const toggleToolbarBtn = document.getElementById('toggleToolbar');

  // Font selection
  fontSelect.addEventListener('change', function() {
    const selectedFont = fontSelect.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'changeFont',
        font: selectedFont
      });
    });
  });

  // Toggle toolbar
  toggleToolbarBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleToolbar'
      });
    });
  });

  // Load saved settings
  chrome.storage.local.get(['font'], function(result) {
    if (result.font) {
      fontSelect.value = result.font;
    }
  });
}); 