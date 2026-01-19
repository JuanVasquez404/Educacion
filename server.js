const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



//Sandro
const authRouter = require('./routes/auth');
const cursosRouter = require('./routes/cursos');
//usar las rutas Curso
app.use('/api/auth',authRouter);
app.use('/api/cursos',cursosRouter);

//Importar Rutas
const authRoutes = require('./routes/auth');
const inscripcionesRoutes = require('./routes/inscripciones');

//Rutas Juan
app.use('/api/auth', authRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);

feature/modulo-cursos



//Importar Rutas Dayana Intriago
const profesoresRoutes = require('./routes/profesores');

//Rutas Dayana Intriago
app.use('/api/profesores', profesoresRoutes);


//ruta de ejemplo
main
app.get('/', (req, res) => {
    res.send('Hola desde el servidor Express');
});

//Iniciar el servidorpo
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
