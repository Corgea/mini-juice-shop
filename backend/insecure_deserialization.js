const express = require('express');
const app = express();
const port = 3002;
const bodyParser = require('body-parser');
const deserialize = require('deserialize'); // Hypothetical vulnerable deserialization library

app.use(bodyParser.json());

// Insecure Deserialization vulnerability
app.post('/deserialize', (req, res) => {
    try {
        // Accept only JSON data and validate its shape strictly before use
        if (typeof req.body.serializedData !== 'object' || Array.isArray(req.body.serializedData)) {
            return res.status(400).send('Invalid input format.');
        }
        // Example schema validation: require only fields "foo" (string) and "bar" (number)
        const { foo, bar } = req.body.serializedData;
        if (typeof foo !== 'string' || typeof bar !== 'number') {
            return res.status(400).send('Invalid or missing fields.');
        }
        // Safe usage after validation
        const data = { foo, bar };
        res.send(`Deserialized data: ${JSON.stringify(data)}`);
    } catch (error) {
        res.status(500).send('Deserialization error');
    }
});

app.listen(port, () => {
    console.log(`Insecure Deserialization app listening at http://localhost:${port}`);
});