console.log("Script loaded successfully!");

// Global tasks array
let tasks = [];

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addCreativeBtn = document.getElementById('addCreativeBtn');
const addAcademicBtn = document.getElementById('addAcademicBtn');
const treeImg = document.getElementById('treeImg');

// Preload tree images
const imagePaths = [
  'Images/TreePLACEHOLDER(red).jpg',
  'Images/TreePLACEHOLDER(orange).jpg',
  'Images/TreePLACEHOLDER(green).jpg',
  'Images/TreePLACEHOLDER(blue).jpg',
  'Images/TreePLACEHOLDER(yellow).jpg'
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

    // Removed square brackets around category text
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
    if (treeImg) treeImg.src = 'Images/TreePLACEHOLDER(green).jpg';
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
    treeImg.src = 'Images/TreePLACEHOLDER(red).jpg';
    document.body.className = 'state-academic';
  } else if (academicRatio >= 58) {
    treeImg.src = 'Images/TreePLACEHOLDER(orange).jpg';
    document.body.className = 'state-academic-light';
  } else if (personalRatio >= 66) {
    treeImg.src = 'Images/TreePLACEHOLDER(yellow).jpg';
    document.body.className = 'state-personal';
  } else if (personalRatio >= 58) {
    treeImg.src = 'Images/TreePLACEHOLDER(blue).jpg';
    document.body.className = 'state-personal-light';
  } else {
    treeImg.src = 'Images/TreePLACEHOLDER(green).jpg';
    document.body.className = 'state-balanced';
  }
}

// 4. Function to load data from localStorage or data.json
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
}

// Event Listeners
addCreativeBtn?.addEventListener('click', () => handleTaskSubmit('creative'));
addAcademicBtn?.addEventListener('click', () => handleTaskSubmit('academic'));

// Start app by loading data
loadInitialTasks();