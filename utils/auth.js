
// Importa el paquete jsonwebtoken para la gestión de tokens JWT
const jwt = require('jsonwebtoken');

// Importa bcrypt para el manejo de contraseñas seguras
const bcrypt = require('bcrypt');


// Clave secreta para firmar y verificar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET;


// Función para generar un token después de un login exitoso
function generateToken(payload) {
    // Crea un token JWT con el payload proporcionado y una expiración de 1 hora
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}


// Middleware para verificar el token en cada petición protegida
function verifyToken(req, res, next) {
    // Obtiene el token del encabezado Authorization
    const token = req.headers['authorization'];
    if (!token) {
        // Si no hay token, deniega el acceso
        return res.status(401).json({ message: 'Acceso denegado. No token proporcionado.' });
    }
    try {
        // Verifica y decodifica el token (se espera formato 'Bearer <token>')
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        // Añade la información del usuario al objeto request
        req.user = decoded;
        next();
    } catch (error) {
        // Si el token es inválido, responde con error
        return res.status(401).json({ message: 'Token inválido.' });
    }
}

module.exports = {
    generateToken,
    verifyToken
};