const express = require('express');
const path = require('path');
const app = express();
const PORT = 4000;

// Statické soubory pro druhý server
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Video server běží na http://localhost:${PORT}`);
});
