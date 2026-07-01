const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

const baseDir = path.join(__dirname, 'dist');

app.use(express.static(baseDir));

app.get('*', (req, res) => {
    res.sendFile(path.join(baseDir, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor iniciado e ouvindo na porta ${port}`);
});