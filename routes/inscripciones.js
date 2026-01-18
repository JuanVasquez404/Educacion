const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../utils/auth");
const e = require("express");

//Método Get para un registro único
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params; //Captura el id desde los parámetros de la URL
  const query = "SELECT * FROM inscripciones WHERE id = ?"; //Consulta para obtener un registro
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(404).json({ message: "Error al obtener Inscripción" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }
    res.json(results[0]);
  });
});

//Método Get para multiples registros con paginación GET
router.get("/", verifyToken, (req, res) => {
  //Obtener parámetros de la URL
  const page = parseInt(req.query.page) || 1; //pagina actual, por defecto 1
  const limit = parseInt(req.query.limit) || 10; // limite de registros por pagina, por defecto 10
  const offset = (page - 1) * limit; // El punto de inicio de la consulta
  const cadena = req.query.cadena;
  let whereClause = "";
  let queryParams = [];
  if (cadena) {
    whereClause = "where estudiante_id like ? or nombre_estudiante like ? ";
    const searchTerm = `%${cadena}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  //Consultar para obtener total de registros
  const countQuery = `SELECT COUNT(*) AS total FROM inscripciones ${whereClause}`;
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Error al obtener el total de inscripciones" });
    }
    const totalInscripciones = countResult[0]["total"];
    const totalPages = Math.ceil(totalInscripciones / limit);
    //Consultar para obtener los registros de la página
    const inscripcionesQuery = `SELECT * FROM inscripciones ${whereClause} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    db.query(inscripcionesQuery, queryParams, (err, inscripcionesResults) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error al obtener las inscripciones" });
      }
      //Enviar respuesta con los datos y la información de paginación
      res.json({
        totalItems: totalInscripciones,
        totalPages: totalPages,
        currentPage: page,
        perPage: limit,
        data: inscripcionesResults,
      });
    });
  });
});

//Post para crear un nuevo registro
router.post("/", verifyToken, (req, res) => {
  const { estudiante_id, nombre_estudiante, apellido_estudiante, curso_id, fecha, observacion } = req.body;

  const search_query =
    "SELECT COUNT(*) AS contador FROM inscripciones WHERE estudiante_id = ?";
  db.query(search_query, [estudiante_id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ Error: "Error interno al verificar la inscripción" });
    }
    if (result[0].contador > 0) {
      return res
        .status(409)
        .json({ Error: "La inscripción " + estudiante_id + " ya existe" });
    }

    const query = "INSERT INTO inscripciones VALUES (null, ?, ?, ?, ?, ?, ?)";
    const values = [estudiante_id, nombre_estudiante, apellido_estudiante, curso_id, fecha, observacion];
    db.query(query, values, (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: `Error al crear Inscripción ${err.message}` });
      }
      res.status(201).json({
        message: `Inscripción creada exitosamente con ID: ${result.insertId}`,
        id: result.insertId,
      });
    });
  });
});


//Metodo Put
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const {
    estudiante_id,
    nombre_estudiante,
    apellido_estudiante,
    curso_id,
    fecha,
    observacion,
  } = req.body;
  const query = `
      UPDATE inscripciones 
      SET estudiante_id = ?, nombre_estudiante = ?, apellido_estudiante = ?, curso_id = ?, fecha = ?, observacion = ?
      WHERE id = ?;
    `;
  db.query(
    query,
    [
      estudiante_id,
      nombre_estudiante,
      apellido_estudiante,
      curso_id,
      fecha,
      observacion,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ Error: "error al actualizar la inscripción" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ Messaje: "inscripción no encontrada" });
      }
      res.json({ message: "inscripción actualizada con éxito" });
    }
  );
});

//Metodo delete
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const search_query =
    "SELECT COUNT (*) as contador FROM inscripciones WHERE id = ?";
  db.query(search_query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ Error: "error interno al verificar la inscripción" });
    }
    if (results[0].contador > 0) {
      return res.status(409).json({
        Messaje:
          "Inscripción no se puede eliminar por que depente de otras tabla",
      });
    }
    const query = "DELETE FROM inscripciones WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ Error: "error al eliminar la inscripción" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ Messaje: "inscripción no encontrada" });
      }
      res.json({ message: "inscripción eliminada con éxito" });
    });
  });

  // const deleteCalificaciones = "DELETE FROM calificaciones WHERE inscripcion_id = ?";
  // db.query(deleteCalificaciones, [id], (err) => {
  //   if (err) {
  //     console.error(err);
  //     return res.status(500).json({ Error: "error al eliminar calificaciones asociadas" });
  //   }
  // });
});

module.exports = router;
