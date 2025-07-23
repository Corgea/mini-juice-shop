require('url')
require('dns')
require('net')
const express = require('express');
const app = express();
const port = 3003;
const axios = require('axios');

// Server-Side Request Forgery (SSRF) vulnerability
app.get('/fetch', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('Missing URL parameter');
    }
    // Allowlist protocols and hostnames
    const allowedHosts = ['example.com', 'api.example.com'];
    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        return res.status(400).send('Invalid URL');
    }
    // Restrict protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
        return res.status(400).send('Protocol not allowed');
    }
    // Hostname allowlist
    if (!allowedHosts.includes(parsed.hostname)) {
        return res.status(403).send('Host not allowed');
    }
    // Prevent SSRF by resolving host and checking for private IPs
    try {
        const addresses = await dns.lookup(parsed.hostname, { all: true });
        for (const addr of addresses) {
            if (net.isPrivate(addr.address) // Node 20+ or via custom logic for older
                || addr.address.startsWith('127.') // IPv4 loopback
                || addr.address === '::1') { // IPv6 loopback
                return res.status(403).send('Access to private/internal host denied');
            }
        }
    } catch (e) {
        return res.status(400).send('Host resolution error');
    }
    try {
        const response = await axios.get(parsed.href);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching URL');
    }
});

app.listen(port, () => {
    console.log(`SSRF app listening at http://localhost:${port}`);
});