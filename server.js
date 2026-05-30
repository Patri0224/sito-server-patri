const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Connessione al database MariaDB
const connection = mysql.createConnection({
  host: 'database',
  user: 'utente_sito',
  password: 'Patrizio.24',
  database: 'db_sito'
});

// Permette a Node di leggere sia i dati dei Form (POST) sia i dati JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📂 Rende la cartella "famiglia" pubblica. 
// Se vai su /famiglia/spesa/spesa.html il browser la leggerà direttamente.
app.use('/famiglia', express.static(path.join(__dirname, 'famiglia')));

// Reindirizzamento di cortesia: se l'utente va sulla radice (/), lo mandiamo alla spesa
app.get('/', (req, res) => {
  res.redirect('/famiglia/spesa/spesa.html');
});

// --- API API API ---

// 1. GET: Restituisce la lista della spesa in formato JSON
app.get('/api/spesa', (req, res) => {
  connection.query('SELECT * FROM spesa ORDER BY priorita ASC, nome ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. POST: Aggiunge o aggiorna un elemento
app.post('/api/spesa/aggiungi', (req, res) => {
  let { nome, priorita, quantita } = req.body;
  if (priorita === "" || priorita === undefined) priorita = null;
  if (quantita === "" || quantita === undefined) quantita = null;

  const query = 'INSERT INTO spesa (nome, priorita, quantita) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE priorita=?, quantita=?';
  connection.query(query, [nome, priorita, quantita, priorita, quantita], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 3. POST: Elimina un singolo elemento
app.post('/api/spesa/elimina-singolo', (req, res) => {
  const { nome } = req.body;
  connection.query('DELETE FROM spesa WHERE nome = ?', [nome], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 4. POST: Svuota la lista completa
app.post('/api/spesa/svuota-tutto', (req, res) => {
  connection.query('TRUNCATE TABLE spesa', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server API Spesa attivo sulla porta ${port}`);
});