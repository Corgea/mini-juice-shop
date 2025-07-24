const express = require('express');
const app = express();
const port = 3001;

// Simulated user data
const users = {
    '1': { id: 1, name: 'Alice', role: 'admin' },
    '2': { id: 2, name: 'Bob', role: 'user' }
};

// Simulated login endpoint
app.post('/login', (req, res) => {
    const { userId } = req.query;
    const user = users[userId];
    if (user) {
        res.send(`Logged in as ${user.name}`);
    } else {
        res.status(401).send('Invalid user');
    }
});

// Insecure Direct Object Reference (IDOR) vulnerability
app.get('/user/:id', (req, res) => {
    // Simulate authentication: get user ID from a header (e.g., X-User-Id)
    const requesterId = req.header('X-User-Id');
    const requestedId = req.params.id;
    if (!requesterId) {
        return res.status(401).send('Authentication required');
    }
    if (requesterId !== requestedId) {
        return res.status(403).send('Forbidden: You are not allowed to access this user\'s data');
    }
    const user = users[requesterId];
    if (user) {
        res.json(user); // Authorized access
    } else {
        res.status(404).send('User not found');
    }
});

app.listen(port, () => {
    console.log(`IDOR app listening at http://localhost:${port}`);
});