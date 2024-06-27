document.addEventListener('DOMContentLoaded', () => {
    const taskListItems = document.getElementById('task-list-items');
    const addTaskButton = document.getElementById('add-task');
    const searchInput = document.getElementById('search');


    function clearForm() {
        document.getElementById('task-name').value = '';
      
        document.getElementById('task-description').value = '';
        document.getElementById('assigned-to').value = '';
        document.getElementById('deadline').value = '';
        document.getElementById('priority').value = '';
    }

    function renderTask(task) {
        // Find the existing task item in the container
        const existingTaskItem = taskListItems.querySelector(`[data-index="${task.id}"]`);
    
        if (existingTaskItem) {
            // If the task already exists, update its content
            existingTaskItem.innerHTML = `
                <p>Name: ${task.name}</p>
                <p>Description: ${task.description}</p>
                <p>Assigned To: ${task.assignedTo}</p>
                <p>Deadline: ${task.deadline}</p>
                <p>Priority: ${task.priority}</p>
                <button class="edit-button" data-index="${task.id}">Edit</button>
                <button class="delete-button" data-index="${task.id}">Delete</button>
            `;
        } else {
            // If the task doesn't exist, create a new task item
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.setAttribute('data-index', task.id);
            taskItem.innerHTML = `
                <p>Name: ${task.name}</p>
                <p>Description: ${task.description}</p>
                <p>Assigned To: ${task.assignedTo}</p>
                <p>Deadline: ${task.deadline}</p>
                <p>Priority: ${task.priority}</p>
                <button class="edit-button" data-index="${task.id}">Edit</button>
                <button class="delete-button" data-index="${task.id}">Delete</button>
            `;
            taskListItems.appendChild(taskItem);
        }
    }
    

    async function getTasks() {
        try {
            const response = await fetch('/tasks');
            const tasks = await response.json();
            tasks.forEach(task => renderTask(task)); // Render each task individually
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    async function addTask() {
        const name = document.getElementById('task-name').value;
        const description = document.getElementById('task-description').value;
        const assignedTo = document.getElementById('assigned-to').value;
        const deadline = document.getElementById('deadline').value;
        const priority = document.getElementById('priority').value;

        const currentDate = new Date().toISOString().split('T')[0];

        if (!name || !description || !assignedTo || !deadline || !priority) {
            alert('Please fill in all fields.');
            return;
        }

        if (deadline < currentDate) {
            alert('Please select a date equal to or greater than the current date.');
            return;
        }

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description, assignedTo, deadline, priority }),
            });

            const newTask = await response.json();
            renderTask(newTask);  // Render only the new task
            clearForm();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    async function editTask(taskId) {
        try {
            const response = await fetch(`/tasks/${taskId}`);
            const taskToEdit = await response.json();
    
            const updatedName = prompt('Update name:', taskToEdit.name);
            const updatedDescription = prompt('Update description:', taskToEdit.description);
            const updatedAssignedTo = prompt('Update assigned to:', taskToEdit.assignedTo);
            const updatedDeadline = prompt('Update deadline (yyyy-mm-dd):', taskToEdit.deadline);
            const updatedPriority = prompt('Update priority (Low/Medium/High):', taskToEdit.priority);
    
            const updatedTaskData = {
                name: updatedName || taskToEdit.name,
                description: updatedDescription || taskToEdit.description,
                assignedTo: updatedAssignedTo || taskToEdit.assignedTo,
                deadline: updatedDeadline || taskToEdit.deadline,
                priority: updatedPriority || taskToEdit.priority,
            };
    
            const updateResponse = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTaskData),
            });
    
            if (updateResponse.ok) {
                const updatedTask = await updateResponse.json();
                renderTask(updatedTask); // Render the updated task
            } else {
                console.error('Error updating task:', updateResponse.statusText);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }
    
    

    async function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await fetch(`/tasks/${taskId}`, {
                    method: 'DELETE',
                });
    
                // Remove the deleted task item from the container
                const deletedTaskItem = taskListItems.querySelector(`[data-index="${taskId}"]`);
                if (deletedTaskItem) {
                    taskListItems.removeChild(deletedTaskItem);
                }
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    }
    

    async function searchTasks() {
        const searchText = searchInput.value.toLowerCase();
        if (searchText.trim() === '') {
            // If search input is empty, fetch all tasks
            getTasks();
            return;
        }
    
        try {
            const response = await fetch('/tasks');
            const tasks = await response.json();
    
            const filteredTasks = tasks.filter(task =>
                Object.values(task).some(value => value.toString().toLowerCase().includes(searchText))
            );
    
            // Clear the existing tasks before rendering the filtered tasks
            taskListItems.innerHTML = '';
    
            filteredTasks.forEach(task => renderTask(task)); // Render each filtered task individually
        } catch (error) {
            console.error('Error searching tasks:', error);
        }
    }
    


    // Initialize by fetching tasks from the server
    getTasks();

    // Event listeners
    addTaskButton.addEventListener('click', addTask);

    searchInput.addEventListener('input', searchTasks);

    taskListItems.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-button')) {
            const index = event.target.getAttribute('data-index');
            editTask(index);
        } else if (event.target.classList.contains('delete-button')) {
            const index = event.target.getAttribute('data-index');
            deleteTask(index);
        }
    });
});
