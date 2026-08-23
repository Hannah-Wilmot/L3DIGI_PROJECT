console.log("Script loaded successfully!");

// Global tasks array
let tasks = [];

// Pomodoro Timer State Variables
let timerInterval = null;
let totalSessionTime = 30 * 60; // Total starting seconds (default 30m)
let timeLeft = totalSessionTime;
let isBreak = false;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addCreativeBtn = document.getElementById('addCreativeBtn');
const addAcademicBtn = document.getElementById('addAcademicBtn');
const treeImg = document.getElementById('treeImg');

// Timer DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimerBtn');
const pauseTimerBtn = document.getElementById('pauseTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const addTimeBtn = document.getElementById('addTimeBtn');
const minusTimeBtn = document.getElementById('minusTimeBtn');
const pomoProgressRing = document.getElementById('pomoProgressRing');

// Ring circumference: 2 * Math.PI * r (where r = 90)
const RING_CIRCUMFERENCE = 2 * Math.PI * 90;

// Preload tree images
const imagePaths = [
  'Images/AcademicImbalance.jpeg',
  'Images/TransitionCreative.jpeg',
  'Images/BalancedState.jpeg',
  'Images/TransitionAcademic.jpeg',
  'Images/CreativeImbalance.jpeg'
];
imagePaths.forEach(src => { new Image().src = src; });

// 1. Function to handle adding a task from input
function handleTaskSubmit(category) {
  const taskText = taskInput.value.trim();

  if (taskText === '') {
    alert('Please enter a task name first!');
    return;
  }

  // Generate date and time stamp
  const now = new Date();
  const timeString = now.toLocaleDateString() + ' | ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  tasks.push({
    text: taskText,
    category: category,
    timestamp: timeString
  });

  localStorage.setItem('userTasks', JSON.stringify(tasks));
  taskInput.value = '';

  renderTaskLog();
  updateTreeImage();
}

// 2. Function to render logged tasks with date/time into nested scrollbox
function renderTaskLog() {
  const logContainer = document.getElementById('taskLogContainer');
  if (!logContainer) return;

  logContainer.innerHTML = '';

  if (tasks.length === 0) {
    logContainer.innerHTML = '<p class="empty-msg">No tasks logged yet.</p>';
    return;
  }

  // Render tasks with newest on top
  tasks.slice().reverse().forEach((task) => {
    const taskItem = document.createElement('div');
    taskItem.className = `task-log-entry task-${task.category}`;

    const dateText = task.timestamp ? task.timestamp : 'Previously logged';

    taskItem.innerHTML = `
      <div class="log-header">
        <span class="log-category">${task.category.toUpperCase()}</span>
        <span class="log-time">${dateText}</span>
      </div>
      <div class="log-body">${task.text}</div>
    `;
    logContainer.appendChild(taskItem);
  });
}

// 3. Function to update ratio calculations based on RECENT 12 tasks, tree image, and UI colors
function updateTreeImage() {
  const totalTasks = tasks.length;

  if (totalTasks === 0) {
    document.body.className = 'state-balanced';
    if (treeImg) treeImg.src = 'Images/BalancedState.jpeg';
    return;
  }

  // Look only at the most recent 12 tasks logged
  const recentTasks = tasks.slice(-12);
  const recentTotal = recentTasks.length;

  const academicCount = recentTasks.filter(task => task.category === 'academic').length;
  const personalCount = recentTasks.filter(task => task.category === 'creative').length;

  const academicRatio = (academicCount / recentTotal) * 100;
  const personalRatio = (personalCount / recentTotal) * 100;

  console.log(`Recent Tasks Window (Last ${recentTotal}): Academic = ${academicCount} | Personal = ${personalCount}`);
  console.log(`Recent Ratios -> Academic: ${academicRatio.toFixed(1)}% | Personal: ${personalRatio.toFixed(1)}%`);

  if (!treeImg) {
    console.error('Error: Could not find element with id="treeImg"');
    return;
  }

  if (academicRatio >= 66) {
    treeImg.src = 'Images/AcademicImbalance.jpeg';
    document.body.className = 'state-academic';
  } else if (academicRatio >= 58) {
    treeImg.src = 'Images/TransitionAcademic.jpeg';
    document.body.className = 'state-academic-light';
  } else if (personalRatio >= 66) {
    treeImg.src = 'Images/CreativeImbalance.jpeg';
    document.body.className = 'state-personal';
  } else if (personalRatio >= 58) {
    treeImg.src = 'Images/TransitionCreative.jpeg';
    document.body.className = 'state-personal-light';
  } else {
    treeImg.src = 'Images/BalancedState.jpeg';
    document.body.className = 'state-balanced';
  }
}

// 4. Pomodoro Timer & Retracting Progress Ring Logic
function updateTimerDisplay() {
  if (!timerDisplay) return;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update animated SVG stroke retraction
  if (pomoProgressRing) {
    const fraction = timeLeft / totalSessionTime;
    const offset = RING_CIRCUMFERENCE * (1 - fraction);
    pomoProgressRing.style.strokeDashoffset = offset;
  }
}

function startTimer() {
  if (timerInterval) return; // Prevent multiple timers

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;

      // Toggle between Work and Break
      isBreak = !isBreak;
      totalSessionTime = isBreak ? (15 * 60) : (30 * 60);
      timeLeft = totalSessionTime;

      alert(isBreak ? "Your task is done, congratulations! It's time to take a break."
        : "Break time has finished, what task is next?");
      updateTimerDisplay();
      startTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  isBreak = false;
  totalSessionTime = 30 * 60;
  timeLeft = totalSessionTime;
  updateTimerDisplay();
}

function adjustMinutes(amountInMinutes) {
  const amountInSeconds = amountInMinutes * 60;
  if (timeLeft + amountInSeconds >= 60) { // Don't go below 1 minute
    timeLeft += amountInSeconds;
    // Keep total session duration matched if user increases baseline
    if (timeLeft > totalSessionTime) {
      totalSessionTime = timeLeft;
    }
    updateTimerDisplay();
  }
}

// 5. Function to load data from localStorage or data.json
async function loadInitialTasks() {
  const savedTasks = localStorage.getItem('userTasks');

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    try {
      const response = await fetch('./data.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      tasks = await response.json();
      localStorage.setItem('userTasks', JSON.stringify(tasks));
    } catch (error) {
      console.log('No default data.json loaded, starting empty:', error);
      tasks = [];
    }
  }

  renderTaskLog();
  updateTreeImage();
  updateTimerDisplay();
}

// Event Listeners
addCreativeBtn?.addEventListener('click', () => handleTaskSubmit('creative'));
addAcademicBtn?.addEventListener('click', () => handleTaskSubmit('academic'));

// Timer Event Listeners
startTimerBtn?.addEventListener('click', startTimer);
pauseTimerBtn?.addEventListener('click', pauseTimer);
resetTimerBtn?.addEventListener('click', resetTimer);
addTimeBtn?.addEventListener('click', () => adjustMinutes(1));
minusTimeBtn?.addEventListener('click', () => adjustMinutes(-1));

// Start app by loading data
loadInitialTasks();