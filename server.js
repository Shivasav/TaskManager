const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static('public'));

const tasksFilePath = 'tasks.json';

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html'); 
    res.sendFile(filePath);
});


// Read all tasks
app.get('/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf-8');
        const tasks = JSON.parse(data);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Read a single task
app.get('/tasks/:taskId', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf-8');
        const tasks = JSON.parse(data);
        const taskId = parseInt(req.params.taskId, 10);

        const task = tasks.find(t => t.id === taskId);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new task
app.post('/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf-8');
        const tasks = JSON.parse(data);
        const newTask = { id: tasks.length + 1, ...req.body };
        tasks.push(newTask);
        await fs.writeFile(tasksFilePath, JSON.stringify(tasks));
        res.json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a task
app.put('/tasks/:taskId', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf-8');
        let tasks = JSON.parse(data);
        const taskId = parseInt(req.params.taskId, 10);

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
            await fs.writeFile(tasksFilePath, JSON.stringify(tasks));
            res.json(tasks[taskIndex]);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a task
app.delete('/tasks/:taskId', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFilePath, 'utf-8');
        let tasks = JSON.parse(data);
        const taskId = parseInt(req.params.taskId, 10);

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const deletedTask = tasks.splice(taskIndex, 1)[0];
            await fs.writeFile(tasksFilePath, JSON.stringify(tasks));
            res.json(deletedTask);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});