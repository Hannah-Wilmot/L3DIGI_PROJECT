const taskInput = document.getElementById('taskInput');
const addCreativeBtn = document.getElementById('addCreativeBtn');
const addAcademicBtn = document.getElementById('addAcademicBtn');

// Helper function to capture and clear input
function handleTaskSubmit(category) {
  const taskText = taskInput.value.trim();
  
  if (taskText === '') return; // Prevent empty tasks

  console.log(`New Task: "${taskText}" | Category: ${category}`);
  
  // Clear the input field after submitting
  taskInput.value = '';
}

// Event Listeners
addCreativeBtn.addEventListener('click', () => handleTaskSubmit('creative'));
addAcademicBtn.addEventListener('click', () => handleTaskSubmit('academic'));