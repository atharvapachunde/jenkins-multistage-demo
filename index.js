const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Inventory API running successfully!'));
app.listen(3000, () => console.log('Inventory API started on port 3000'));
