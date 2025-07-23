const express = require('express');
const app = express();
const port = 3004;

// Simulated product inventory
let inventory = {
    'apple': { price: 1, stock: 10 },
    'banana': { price: 2, stock: 5 }
};

// IDOR Vulnerability: No authorization checks
app.post('/addProduct', (req, res) => {
    let { product, price, stock } = req.query;
    if (
        !product ||
        !/^[a-zA-Z0-9_\- ]+$/.test(product) ||
        isNaN(price) ||
        isNaN(stock) ||
        !isFinite(price) ||
        !isFinite(stock) ||
        Number(price) < 0 ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
    ) {
        return res.status(400).send('Invalid product, price, or stock');
    }
    product = product.trim();
    inventory[product] = { price: parseFloat(price), stock: parseInt(stock, 10) };
    res.send(`Added product ${product}`);
});

app.put('/editProduct', (req, res) => {
    let { product, price, stock } = req.query;
    if (
        !product ||
        !/^[a-zA-Z0-9_\- ]+$/.test(product) ||
        isNaN(price) ||
        isNaN(stock) ||
        !isFinite(price) ||
        !isFinite(stock) ||
        Number(price) < 0 ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
    ) {
        return res.status(400).send('Invalid product, price, or stock');
    }
    product = product.trim();
    if (inventory[product]) {
        inventory[product] = { price: parseFloat(price), stock: parseInt(stock, 10) };
        res.send(`Edited product ${product}`);
    } else {
        res.status(400).send('Product not found');
    }
});

app.delete('/deleteProduct', (req, res) => {
    let { product } = req.query;
    if (
        !product ||
        !/^[a-zA-Z0-9_\- ]+$/.test(product)
    ) {
        return res.status(400).send('Invalid product');
    }
    product = product.trim();
    if (inventory[product]) {
        delete inventory[product];
        res.send(`Deleted product ${product}`);
    } else {
        res.status(400).send('Product not found');
    }
});

// Business Logic Vulnerability
app.post('/purchase', (req, res) => {
    let { product, quantity } = req.query;
    if (
        !product ||
        !/^[a-zA-Z0-9_\- ]+$/.test(product) ||
        isNaN(quantity) ||
        !isFinite(quantity) ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        return res.status(400).send('Invalid product or quantity');
    }
    product = product.trim();
    quantity = parseInt(quantity, 10);
    if (inventory[product] && inventory[product].stock >= quantity) {
        inventory[product].stock -= quantity;
        res.send(`Purchased ${quantity} ${product}(s)`);
    } else {
        res.status(400).send('Insufficient stock');
    }
});

// Flawed logic: allows negative quantity to increase stock
app.post('/return', (req, res) => {
    let { product, quantity } = req.query;
    if (
        !product ||
        !/^[a-zA-Z0-9_\- ]+$/.test(product) ||
        isNaN(quantity) ||
        !isFinite(quantity) ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        return res.status(400).send('Invalid product or quantity');
    }
    product = product.trim();
    quantity = parseInt(quantity, 10);
    if (inventory[product]) {
        inventory[product].stock += quantity;
        res.send(`Returned ${quantity} ${product}(s)`);
    } else {
        res.status(400).send('Invalid product');
    }
});

app.listen(port, () => {
    console.log(`Business Logic app listening at http://localhost:${port}`);
});