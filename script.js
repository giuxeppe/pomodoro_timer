// Global variables
let timeLeft = 25 * 60;
let timerInterval;
let currentInterval = 'pomodoro';
let backgroundColor = '#F1F1EF';
let fontColor = '#37352F';

const INTERVAL_DEFAULTS = {
  'pomodoro': 25 * 60,
  'pomodoro-pro': 50 * 60,
  'short-break': 5 * 60,
  'long-break': 10 * 60,
};

// DOM elements
const timeLeftEl = document.getElementById('time-left');
const startStopBtn = document.getElementById('start-stop-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroIntervalBtn = document.getElementById('pomodoro-interval-btn');
const pomodoroProIntervalBtn = document.getElementById('pomodoro-pro-interval-btn');
const shortBreakIntervalBtn = document.getElementById('short-break-interval-btn');
const longBreakIntervalBtn = document.getElementById('long-break-interval-btn');
const customIntervalBtn = document.getElementById('custom-interval-btn');
const customInputPanel = document.getElementById('custom-input-panel');
const customMinutesInput = document.getElementById('custom-minutes');
const customSecondsInput = document.getElementById('custom-seconds');
const setCustomBtn = document.getElementById('set-custom-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.querySelector('.close-btn');
const backgroundColorSelect = document.getElementById('background-color');
const fontColorSelect = document.getElementById('font-color');
const saveBtn = document.getElementById('save-btn');
const pomodoroLogo = document.getElementById('pomodoro-logo');

// Nuovi elementi DOM per l'avviso a schermo
const alertModal = document.getElementById('alert-modal');
const alertCloseBtn = document.getElementById('alert-close-btn');

// Helper: switch interval
function switchInterval(name, seconds) {
  stopTimer();
  currentInterval = name;
  timeLeft = seconds;
  updateTimeLeftTextContent();
  startStopBtn.textContent = 'Start';
  document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(name + '-interval-btn');
  if (activeBtn) activeBtn.classList.add('active');
}

// Interval buttons
pomodoroIntervalBtn.addEventListener('click', () => {
  customInputPanel.style.display = 'none';
  switchInterval('pomodoro', INTERVAL_DEFAULTS['pomodoro']);
});

pomodoroProIntervalBtn.addEventListener('click', () => {
  customInputPanel.style.display = 'none';
  switchInterval('pomodoro-pro', INTERVAL_DEFAULTS['pomodoro-pro']);
});

shortBreakIntervalBtn.addEventListener('click', () => {
  customInputPanel.style.display = 'none';
  switchInterval('short-break', INTERVAL_DEFAULTS['short-break']);
});

longBreakIntervalBtn.addEventListener('click', () => {
  customInputPanel.style.display = 'none';
  switchInterval('long-break', INTERVAL_DEFAULTS['long-break']);
});

customIntervalBtn.addEventListener('click', () => {
  const isVisible = customInputPanel.style.display === 'flex';
  customInputPanel.style.display = isVisible ? 'none' : 'flex';
});

setCustomBtn.addEventListener('click', () => {
  const mins = Math.max(0, Math.min(99, parseInt(customMinutesInput.value) || 0));
  const secs = Math.max(0, Math.min(59, parseInt(customSecondsInput.value) || 0));
  const total = mins * 60 + secs;
  if (total === 0) return;
  customInputPanel.style.display = 'none';
  stopTimer();
  currentInterval = 'custom';
  timeLeft = total;
  updateTimeLeftTextContent();
  startStopBtn.textContent = 'Start';
  document.querySelectorAll('.interval-btn').forEach(b => b.classList.remove('active'));
  customIntervalBtn.classList.add('active');
});

// Clamp seconds input on blur
customSecondsInput.addEventListener('blur', () => {
  let v = parseInt(customSecondsInput.value) || 0;
  if (v > 59) { customSecondsInput.value = 59; }
  if (v < 0) { customSecondsInput.value = 0; }
});

// Start/Stop
startStopBtn.addEventListener('click', () => {
  if (startStopBtn.textContent === 'Start') {
    startTimer();
    startStopBtn.textContent = 'Stop';
  } else {
    stopTimer();
  }
});

// Reset
resetBtn.addEventListener('click', () => {
  stopTimer();
  if (currentInterval === 'custom') {
    const mins = Math.max(0, parseInt(customMinutesInput.value) || 0);
    const secs = Math.max(0, Math.min(59, parseInt(customSecondsInput.value) || 0));
    timeLeft = mins * 60 + secs || 0;
  } else {
    timeLeft = INTERVAL_DEFAULTS[currentInterval] ?? 25 * 60;
  }
  updateTimeLeftTextContent();
  startStopBtn.textContent = 'Start';
});

// Settings
settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
  const newBackgroundColor = backgroundColorSelect.value;
  const newFontColor = fontColorSelect.value;
  localStorage.setItem('backgroundColor', newBackgroundColor);
  localStorage.setItem('fontColor', newFontColor);
  applyUserPreferences();
  settingsModal.style.display = 'none';
});

// Chiudi il popup di avviso a schermo
alertCloseBtn.addEventListener('click', () => {
  alertModal.style.display = 'none';
});

// Timer logic
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimeLeftTextContent();
    if (timeLeft === 0) {
      clearInterval(timerInterval);
      
      // Mostra l'avviso direttamente nello schermo dell'embed
      alertModal.style.display = 'flex';

      // Auto-advance only for standard intervals
      if (currentInterval === 'pomodoro') {
        timeLeft = INTERVAL_DEFAULTS['short-break'];
        currentInterval = 'short-break';
        switchInterval('short-break', timeLeft);
        startTimer();
        startStopBtn.textContent = 'Stop';
      } else if (currentInterval === 'pomodoro-pro') {
        timeLeft = INTERVAL_DEFAULTS['long-break'];
        currentInterval = 'long-break';
        switchInterval('long-break', timeLeft);
        startTimer();
        startStopBtn.textContent = 'Stop';
      } else if (currentInterval === 'short-break') {
        timeLeft = INTERVAL_DEFAULTS['long-break'];
        currentInterval = 'long-break';
        switchInterval('long-break', timeLeft);
        startTimer();
        startStopBtn.textContent = 'Stop';
      } else {
        timeLeft = INTERVAL_DEFAULTS['pomodoro'];
        currentInterval = 'pomodoro';
        switchInterval('pomodoro', timeLeft);
        startStopBtn.textContent = 'Start';
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  startStopBtn.textContent = 'Start';
}

function updateTimeLeftTextContent() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeLeftEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function applyUserPreferences() {
  const savedBackgroundColor = localStorage.getItem('backgroundColor');
  const savedFontColor = localStorage.getItem('fontColor');
  if (savedBackgroundColor) backgroundColor = savedBackgroundColor;
  if (savedFontColor) fontColor = savedFontColor;

  document.body.style.backgroundColor = backgroundColor;
  document.body.style.color = fontColor;
  timeLeftEl.style.color = fontColor;
  if (pomodoroLogo) pomodoroLogo.style.color = fontColor;

  const buttons = document.querySelectorAll('.interval-btn, #start-stop-btn, #reset-btn, #settings-btn');
  buttons.forEach((button) => {
    button.style.color = fontColor;
    button.style.backgroundColor = backgroundColor;
    button.style.borderColor = fontColor;
  });

  const inputs = document.querySelectorAll('#custom-minutes, #custom-seconds');
  inputs.forEach(input => {
    input.style.color = fontColor;
    input.style.borderColor = fontColor;
  });

  const setBtn = document.getElementById('set-custom-btn');
  if (setBtn) {
    setBtn.style.color = backgroundColor;
    setBtn.style.backgroundColor = fontColor;
    setBtn.style.borderColor = fontColor;
  }

  // Applica lo stile dinamico anche al pulsante del nuovo avviso popup
  if (alertCloseBtn) {
    alertCloseBtn.style.color = backgroundColor;
    alertCloseBtn.style.backgroundColor = fontColor;
  }
}

// Init
applyUserPreferences();
switchInterval('pomodoro', INTERVAL_DEFAULTS['pomodoro']);