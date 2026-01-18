const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//Importar Rutas
const authRoutes = require('./routes/auth');
const inscripcionesRoutes = require('./routes/inscripciones');

//Rutas
app.use('/api/auth', authRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

//ruta de ejemplo
app.get('/', (req, res) => {
    res.send('Hola desde el servidor Express');
});

//Iniciar el servidorpo
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
