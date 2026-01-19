const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../utils/auth");

router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM estudiantes WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al obtener el estudiante" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    } else {
      res.json(result[0]);
    }
  });
});

router.get("/", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1; //pagina actual, por defecto 1
  const limit = parseInt(req.query.limit) || 10; //limite de registros, por defecto 10
  const offset = (page - 1) * limit; //El punto de inicio de la consulta
  const cadena = req.query.cadena;
  let whereClause = ""; //cadena de busqueda, por defecto vacia
  let queryParams = [];
  if (cadena) {
    whereClause = "where nombre like ? or apellido like ? or telefono like ?";
    const searchTerm = `%${cadena}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }
  //consulta para obtener total registros
  const countQuery = `SELECT COUNT(*) AS total FROM estudiantes ${whereClause}`;
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Error al obtener el total de estudiantes" });
    }
    const totalEstudiantes = countResult[0].total;
    const totalPages = Math.ceil(totalEstudiantes / limit);
    //consulta para obtener los registros de la pagina
    const estudiantesQuery = `SELECT * FROM estudiantes ${whereClause} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    db.query(estudiantesQuery, queryParams, (err, estudiantesResult) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Error al obtener los estudiantes" });
      }
      //Enviar respuestas con los datos y la informacion de la paginacion
      res.json({
        totalItems: totalEstudiantes,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        data: estudiantesResult,
      });
    });
  });
});

//Metodo POST para crear un nuevo estudiante
router.post("/", verifyToken, async (req, res) => {
  //Obtener los datos
  const { nombre, apellido, fecha_nacimiento, genero, correo, telefono } =
    req.body;
  const search_query =
    "SELECT COUNT(correo) AS contador FROM estudiantes WHERE correo = ?";
  db.query(search_query, [correo], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al verificar el correo" });
    }
    if (result[0].contador > 0) {
      return res.status(409).json({
        error: "El estudiante con correo " + correo + " ya está registrado",
      });
    }
    const query = "INSERT INTO estudiantes VALUES (null, ?, ?, ?, ?, ?, ?)";
    const values = [
      nombre,
      apellido,
      fecha_nacimiento,
      genero,
      correo,
      telefono,
    ];
    //Insertar en la base de datos
    db.query(query, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error al crear el estudiante" });
      }
      res.status(201).json({
        message: "Estudiante creado exitosamente",
        id: result.insertId,
      });
    });
  });
});

//Metodo PUT para actualizar un estudiante existente
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, fecha_nacimiento, genero, correo, telefono } =
    req.body;
  const query =
    "UPDATE estudiantes SET nombre = ?, apellido = ?, fecha_nacimiento = ?, genero = ?, correo = ?, telefono = ? WHERE id = ?";
  const values = [
    nombre,
    apellido,
    fecha_nacimiento,
    genero,
    correo,
    telefono,
    id,
  ];
  db.query(query, values, (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Error al actualizar el estudiante" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }
    res.status(201).json({ message: "Estudiante actualizado exitosamente" });
  });
});

//Metodo DELETE para eliminar un estudiante existente
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const search_query =
    "SELECT COUNT(id) AS contador FROM inscripciones WHERE estudiante_id = ?";
  db.query(search_query, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al verificar la inscripcion" });
    }
    if (result[0].contador > 0) {
      return res.status(409).json({
        error: "El estudiante no se puede eliminar porque tiene inscripciones activas",
      });
    }
    const query = "DELETE FROM estudiantes WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Error al eliminar el estudiante" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Estudiante no encontrado" });
      }
      res.status(201).json({ message: "Estudiante eliminado exitosamente" });
    });
  });
});

module.exports = router;
