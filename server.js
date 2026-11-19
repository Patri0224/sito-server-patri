const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: 'database',
  user: 'utente_sito',
  password: 'Patrizio.24',
  database: 'db_sito'
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 1. GET: Restituisce la lista della spesa
app.get('/api/spesa', (req, res) => {
  connection.query('SELECT * FROM spesa ORDER BY priorita ASC, nome ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. POST: Aggiunge alla lista della spesa E aggiorna lo storico dei cibi
app.post('/api/spesa/aggiungi', (req, res) => {
  let { nome, priorita, quantita } = req.body;
  if (priorita === "" || priorita === undefined) priorita = null;
  if (quantita === "" || quantita === undefined) quantita = null;

  const querySpesa = 'INSERT INTO spesa (nome, priorita, quantita) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE priorita=?, quantita=?';
  connection.query(querySpesa, [nome, priorita, quantita, priorita, quantita], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Aggiorna lo storico aumentando di 1 il contatore se il nome esiste già
    const queryStorico = 'INSERT INTO storico_cibi (nome, utilizzi) VALUES (?, 1) ON DUPLICATE KEY UPDATE utilizzi = utilizzi + 1';
    connection.query(queryStorico, [nome], (errStorico) => {
      if (errStorico) console.error('Errore aggiornamento storico:', errStorico);
      res.json({ success: true });
    });
  });
});

// 3. GET: Cerca nei cibi storici ordinando per prefisso, frequenza d'uso e ordine alfabetico
app.get('/api/suggerimenti', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const query = `
    SELECT nome, utilizzi 
    FROM storico_cibi 
    WHERE nome LIKE ? 
    ORDER BY 
      CASE WHEN nome LIKE ? THEN 0 ELSE 1 END ASC,
      utilizzi DESC,
      nome ASC
    LIMIT 10
  `;
  
  connection.query(query, [`%${q}%`, `${q}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 4. POST: Elimina un singolo elemento
app.post('/api/spesa/elimina-singolo', (req, res) => {
  const { nome } = req.body;
  connection.query('DELETE FROM spesa WHERE nome = ?', [nome], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 5. POST: Svuota la lista completa
app.post('/api/spesa/svuota-tutto', (req, res) => {
  connection.query('TRUNCATE TABLE spesa', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server API Spesa attivo sulla porta ${port}`);
});