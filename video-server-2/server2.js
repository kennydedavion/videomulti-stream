const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});

app.listen(PORT, () => {
  console.log(`Video server 2 is running on http://localhost:${PORT}`);
});
