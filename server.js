// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'albums');
const PASSWORD = 'admin123';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load all albums
app.get('/api/albums', (req, res) => {
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) return res.status(500).send('Server error');

    const albums = files.filter(f => f.endsWith('.json')).map(f => {
      const raw = fs.readFileSync(path.join(DATA_DIR, f));
      return JSON.parse(raw);
    });

    res.json(albums);
  });
});

// Load single album
app.get('/api/album/:id', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

  const data = fs.readFileSync(filePath);
  res.json(JSON.parse(data));
});

// Save/update album
app.post('/api/album/:id', (req, res) => {
  const { password, album } = req.body;
  if (password !== PASSWORD) return res.status(403).send('Forbidden');

  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(album, null, 2));
  res.send('Saved');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
