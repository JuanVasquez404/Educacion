const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('../utils/auth');
const bcrypt = require('bcrypt');

//Método Get para un registro único
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //Captura el id desde los parámetros de la URL
    const query = 'SELECT * FROM profesores WHERE id = ?'; //Consulta para obtener un registro
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(404).json({ message: 'Error al obtener Profesor' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        res.json(results[0]); //Envia el registro encontrado
    });
});

//Método Get para multiples registros con paginación y búsqueda
router.get('/', verifyToken, (req, res) => {
    //Obtener parámetros de la URL
    const page = parseInt(req.query.page) || 1; //pagina actual, por defecto 1
    const limit = parseInt(req.query.limit) || 10; // limite de registros por pagina, por defecto 10
    const offset = (page - 1) * limit; // El punto de inicio de la consulta
    const cadena = req.query.cadena; // cadena de búsqueda
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'WHERE nombre LIKE ?  OR apellido LIKE ? OR correo LIKE ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    //Consultar para obtener total de registros
    const countQuery = `SELECT COUNT(*) AS total FROM profesores ${whereClause}`; // Consulta para obtener el total de registros
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener el total de profesores' });
        }
        const totalProfesores = countResult[0]['total'];
        const totalPages = Math.ceil(totalProfesores / limit);
        //Consultar para obtener los registros de la página
        const profesoresQuery = `SELECT * FROM profesores ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(profesoresQuery, queryParams, (err, profesoresResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener los profesores' });
            }
            //Enviar respuesta con los datos y la información de paginación
            res.json({
                totalItems: totalProfesores,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
                data: profesoresResults
            });
        })
    })
});

//Método Post para crear un registro
router.post('/', verifyToken, async (req, res) => {
    //Obtener los datos
    const { nombre, apellido, telefono, correo, password } = req.body;
    const search_query = 'SELECT COUNT(correo) AS Contador FROM profesores WHERE correo = ?';
    //Buscar si el correo ya existe
    db.query(search_query, [correo], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al buscar el correo' });
        }
        if (result[0].Contador > 0) {
            return res.status(409).json({ error: 'El profesor con correo ' + correo + " ya existe" });
        }
    });

    const query = 'INSERT INTO profesores values (null, ?, ?, ?, ?, ?)';
    try {
        const claveHasheada = await bcrypt.hashSync(correo, 12);
        const values = [nombre, apellido, telefono, correo, claveHasheada];
        //Insertar los datos
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al crear el profesor' });
            }
            res.status(201).json({ message: 'Profesor creado exitosamente', id: result.insertId });
        });
    } catch (error) {
        console.log(error);
    }
});

//Método Put para actualizar un registro
router.put('/:id', verifyToken, async (req, res) => {
    //Obtener los datos
    const { id } = req.params;
    const { nombre, apellido, telefono, correo } = req.body;
    const query = 'UPDATE profesores SET nombre = ?, apellido = ?, telefono = ?, correo = ? WHERE id = ?';
    const values = [nombre, apellido, telefono, correo, id];
    //Actualizar los datos
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar el profesor' });
        }
        if (result.affectedRows === 0) { // Si no se actualizó ningún registro affectedRows es 0
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        res.status(201).json({ message: 'Profesor actualizado exitosamente' });
    });
});

//Método Delete para eliminar un registro
router.delete('/:id', verifyToken, (req, res) => {
    //verificar que el regristro no tenga datos dependientes
    const { id } = req.params;
    const search_query = 'SELECT COUNT(*) AS Contador FROM profesores WHERE id = ?';
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error interno al verificar el profesor' });
        }
        if (result[0].Contador > 0) {
            return res.status(409).json({ error: 'Profesor nose pude eliminar porque tiene datos regristados' });
        }
        //Eliminar el registro
        const delete_query = 'DELETE FROM profesores WHERE id = ?';
        const values = [id];
        db.query(delete_query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar el profesor' });
            }
            if (result.affectedRows === 0) { // Si no se eliminó ningún registro affectedRows es 0
                return res.status(404).json({ message: 'Profesor no encontrado' });
            }
            res.status(201).json({ message: 'Profesor eliminado exitosamente' });
        });
    });

});

module.exports = router;