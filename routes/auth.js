const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const { generateToken } = require('../utils/auth');

router.post('/login', async (req, res) => {
    const { correo, password } = req.body;
    db.query('select * from profesores where correo = ?', [correo], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(401).json({ message: 'correo o contraseña incorrectos' });
        }
        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.contrasena);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'correo o contraseña incorrectos' });
        }
        //Si el Login es exitoso, genera un token y lo envía en la respuesta
        console.log({ id: user.id, correo: user.correo ,
            "Nombre: ": user.nombre, 
            "Apellido: ": user.apellido,
            "Telefono: ": user.telefono});

        const token = generateToken({ id: user.id, correo: user.correo });
        res.json({ message: 'Login exitoso', token });
    });
});

module.exports = router;