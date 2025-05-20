const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, document, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (email, document, password) VALUES (?, ?, ?)',
    [email, document, hashedPassword],
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al registrar usuario', error: err });
      }
      res.json({ message: 'Usuario registrado con éxito' });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { document, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE document = ?',
    [document],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      const token = jwt.sign({ id: user.id, document: user.document }, secret, {
        expiresIn: '2h'
      });

      res.json({ token });
    }
  );
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// CRUD usuarios del sistema (tabla "employees" por ejemplo)
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO employees (name) VALUES (?)', [name], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Empleado agregado' });
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Empleado eliminado' });
  });
});

module.exports = router;
