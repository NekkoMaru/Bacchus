const express = require('express');
const { DateTime } = require('luxon');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        const { default: fetch } = await import('node-fetch');

        const response = await fetch('http://uptime-auction-api.azurewebsites.net/api/Auction');
        const data = await response.json();

        const names = [...new Set(data.map(item => item.productName))];

        let selectedName = req.query.name || '';

        const filteredData = selectedName ? data.filter(item => item.productName.toLowerCase().includes(selectedName.toLowerCase())) : data;

        let selectOptions = '<option value="">All Names</option>';
        names.forEach(name => {
            selectOptions += `<option value="${name}" ${selectedName === name ? 'selected' : ''}>${name}</option>`;
        });

        let html = '<h1>BACCHUS</h1>';
        html += '<form action="/" method="get">';
        html += '<label for="name">Search by Name:</label>';
        html += `<select name="name">${selectOptions}</select>`;
        html += '<button type="submit">Search</button>';
        html += '</form>';
        html += '<h2>Bids</h2>';
        
        filteredData.forEach(item => {
            html += `<p><strong>Name:</strong> ${item.productName}<br>`;
            html += `<strong>Description:</strong> ${item.productDescription}<br>`;
            html += `<strong>Category:</strong> ${item.productCategory}<br>`;
            html += `<strong>Bidding End Date:</strong> ${DateTime.fromISO(item.biddingEndDate).toLocaleString(DateTime.DATETIME_SHORT)}<br>`;
            html += `<form action="/make-bid" method="post">`;
            html += `<input type="hidden" name="productId" value="${item.productId}">`;
            html += `<label for="name">Name:</label>`;
            html += `<input type="text" name="name"><br>`;
            html += `<label for="sum">Sum:</label>`;
            html += `<input type="text" name="sum"><br>`;
            html += `<button type="submit">Make Bid</button>`;
            html += `</form>`;
            html += `</p>`;
        });
        res.send(html);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal server error');
    }
});


app.post('/make-bid', async (req, res) => {
    try {
        const { name, sum, productId } = req.body;
        console.log(`Bid made for product ${productId} by ${name} with sum ${sum}`);
        res.redirect('/');
    } catch (error) {
        console.error('Error processing bid:', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});