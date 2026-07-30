console.log("Script loaded successfully!");

// Array to log tasks with their types
let tasks = [];

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addCreativeBtn = document.getElementById('addCreativeBtn');
const addAcademicBtn = document.getElementById('addAcademicBtn');
const treeImg = document.getElementById('treeImg');

// Function called when a category button is clicked
function handleTaskSubmit(category) {
  const taskText = taskInput.value.trim();
  
  // 1. Prevent empty inputs
  if (taskText === '') {
    alert('Please enter a task name first!');
    return;
  }

  // 2. Log task with its category into the tasks array
  tasks.push({ 
    text: taskText, 
    category: category 
  });
  
  console.log('Task Logged:', { text: taskText, category: category });
  console.log('All Tasks Logged So Far:', tasks);

  // 3. Clear the input box
  taskInput.value = '';

  // 4. Calculate ratio and update tree image
  updateTreeImage();
}

// Function to calculate ratio and swap tree image + UI theme
function updateTreeImage() {
  const totalTasks = tasks.length;

  if (totalTasks === 0) {
    document.body.className = 'state-balanced';
    return;
  }

  const academicCount = tasks.filter(task => task.category === 'academic').length;
  const personalCount = tasks.filter(task => task.category === 'creative').length;

  const academicRatio = (academicCount / totalTasks) * 100;
  const personalRatio = (personalCount / totalTasks) * 100;

  if (!treeImg) {
    console.error('Error: Could not find element with id="treeImg"');
    return;
  }

  // Swap image paths & update Body Theme Class
  if (academicRatio >= 70) {
    treeImg.src = 'Images/TreePLACEHOLDER(red).jpg';
    document.body.className = 'state-academic'; // Apply Academic Theme
  } else if (personalRatio >= 70) {
    treeImg.src = 'Images/TreePLACEHOLDER(yellow).jpg';
    document.body.className = 'state-personal'; // Apply Personal Theme
  } else {
    treeImg.src = 'Images/TreePLACEHOLDER(green).jpg';
    document.body.className = 'state-balanced'; // Apply Balanced Theme
  }
}

// Event Listeners
addCreativeBtn.addEventListener('click', () => handleTaskSubmit('creative'));
addAcademicBtn.addEventListener('click', () => handleTaskSubmit('academic'));

// Preload tree images so swapping is instant
['Images/TreePLACEHOLDER(red).jpg', 'Images/TreePLACEHOLDER(yellow).jpg', 'Images/TreePLACEHOLDER(green).jpg'].forEach(src => { new Image().src = src; });
