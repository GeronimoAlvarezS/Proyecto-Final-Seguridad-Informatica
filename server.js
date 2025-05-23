const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const { poolConnect } = require('./db');

// Agrega esto para mostrar errores de conexión:
poolConnect.catch(err => {
  console.error('❌ Error al conectar con la base de datos SQL Server:', err);
});
