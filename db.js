// Importar el módulo mysql para la conexión a la base de datos
const mysql = require("mysql");

// Cargar las variables de entorno desde el archivo .env
require("dotenv").config();

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,      // Dirección del servidor de base de datos
  user: process.env.DB_USER,      // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña del usuario
  database: process.env.DB_DATABASE, // Nombre de la base de datos
});

// Intentar establecer la conexión con la base de datos
db.connect((err) => {
  if (err) {
    console.log("Se a producido un Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conectado a la base de datos de MySQL");
});

// Exportar la conexión para usarla en otros archivos
module.exports = db;
