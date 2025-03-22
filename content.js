let isHighlighterActive = false;
let currentHighlightColor = '#ffeb3b';
let speechUtterance = null;
let toolbar = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Create and inject the toolbar
function createToolbar() {
  // Remove existing toolbar if it exists
  if (toolbar) {
    toolbar.remove();
  }
  
  toolbar = document.createElement('div');
  toolbar.className = 'dyslexia-toolbar hidden';
  toolbar.innerHTML = `
    <div class="drag-handle" data-tooltip="Drag to move">☰</div>
    <div class="color-picker">
      <div class="color-option" style="background: #ffeb3b" data-color="#ffeb3b" data-tooltip="Yellow"></div>
      <div class="color-option" style="background: #4CAF50" data-color="#4CAF50" data-tooltip="Green"></div>
      <div class="color-option" style="background: #ff9800" data-color="#ff9800" data-tooltip="Orange"></div>
      <div class="color-option" style="background: #e91e63" data-color="#e91e63" data-tooltip="Pink"></div>
    </div>
    <button id="toggleHighlighter" data-tooltip="Toggle Highlighter">
      <span>✏️</span>
    </button>
    <button id="readSelection" data-tooltip="Read Selection">
      <span>🔊</span>
    </button>
    <button id="stopReading" data-tooltip="Stop Reading">
      <span>🔇</span>
    </button>
  `;
  document.body.appendChild(toolbar);

  // Make toolbar draggable
  const dragHandle = toolbar.querySelector('.drag-handle');
  dragHandle.addEventListener('mousedown', startDragging);

  // Setup color picker
  const colorOptions = toolbar.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      currentHighlightColor = option.dataset.color;
      colorOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
    });
  });

  // Activate first color
  colorOptions[0].classList.add('active');

  // Setup buttons
  toolbar.querySelector('#toggleHighlighter').addEventListener('click', () => {
    isHighlighterActive = !isHighlighterActive;
    toolbar.querySelector('#toggleHighlighter').classList.toggle('active');
  });

  toolbar.querySelector('#readSelection').addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      startTextToSpeech(selection.toString());
    }
  });

  toolbar.querySelector('#stopReading').addEventListener('click', stopTextToSpeech);
}

function startDragging(e) {
  isDragging = true;
  dragStartX = e.clientX - toolbar.offsetLeft;
  dragStartY = e.clientY - toolbar.offsetTop;

  document.addEventListener('mousemove', handleDragging);
  document.addEventListener('mouseup', stopDragging);
}

function handleDragging(e) {
  if (!isDragging) return;

  const newX = e.clientX - dragStartX;
  const newY = e.clientY - dragStartY;

  // Keep toolbar within viewport bounds
  const maxX = window.innerWidth - toolbar.offsetWidth;
  const maxY = window.innerHeight - toolbar.offsetHeight;

  toolbar.style.left = Math.min(Math.max(0, newX), maxX) + 'px';
  toolbar.style.top = Math.min(Math.max(0, newY), maxY) + 'px';
  toolbar.style.right = 'auto';
  toolbar.style.bottom = 'auto';
}

function stopDragging() {
  isDragging = false;
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', stopDragging);
}

// Text-to-speech functionality
function startTextToSpeech(text) {
  if (speechUtterance) {
    stopTextToSpeech();
  }

  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.rate = 0.9; // Slightly slower rate for better comprehension
  speechUtterance.pitch = 1;
  window.speechSynthesis.speak(speechUtterance);
}

function stopTextToSpeech() {
  if (speechUtterance) {
    window.speechSynthesis.cancel();
    speechUtterance = null;
  }
}

// Handle text selection and highlighting
document.addEventListener('mouseup', function(e) {
  if (!isHighlighterActive) return;

  const selection = window.getSelection();
  if (!selection.toString()) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.style.backgroundColor = currentHighlightColor;
  span.className = 'dyslexia-highlight';
  
  try {
    range.surroundContents(span);
  } catch (e) {
    console.log('Could not highlight selection');
  }
});

// Initialize immediately instead of waiting for DOMContentLoaded
createToolbar();

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case 'changeFont':
      document.body.style.fontFamily = request.font;
      chrome.storage.local.set({ font: request.font });
      break;
    case 'toggleToolbar':
      if (!toolbar) {
        createToolbar();
      }
      toolbar.classList.toggle('hidden');
      break;
  }
});

// Load saved settings
chrome.storage.local.get(['font'], function(result) {
  if (result.font) {
    document.body.style.fontFamily = result.font;
  }
}); 