const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Přesměrování na druhý server
app.get('/video-server', (req, res) => {
  res.redirect('http://localhost:4000');
});

app.listen(PORT, () => {
  console.log(`Hlavní server běží na http://localhost:${PORT}`);
});
