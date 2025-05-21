const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, sql } = require('../db');

const secret = process.env.JWT_SECRET;

// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, document, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const poolConn = await pool.connect();
    await poolConn.request()
      .input("email", sql.NVarChar, email)
      .input("document", sql.NVarChar, document)
      .input("password", sql.NVarChar, hashedPassword)
      .query("INSERT INTO Users (Email, Document, Password) VALUES (@email, @document, @password)");

    res.json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('❌ Error en /register:', err);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { document, password } = req.body;

  try {
    const poolConn = await pool.connect();
    const result = await poolConn.request()
      .input("document", sql.NVarChar, document)
      .query("SELECT * FROM Users WHERE Document = @document");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.Password); // ← Asegúrate de usar 'Password' con mayúscula

    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.Id, document: user.Document }, secret, {
      expiresIn: '2h'
    });

    res.json({ token });
  } catch (err) {
    console.error('❌ Error en /login:', err);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
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

// CRUD: obtener empleados
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM Employees");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Agregar empleado
router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;
  try {
    await pool.request()
      .input("name", sql.NVarChar, name)
      .query("INSERT INTO Employees (Name) VALUES (@name)");
    res.json({ message: 'Empleado agregado' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Eliminar empleado
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Employees WHERE Id = @id");
    res.json({ message: 'Empleado eliminado' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
