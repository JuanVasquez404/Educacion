const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/auth");
const db = require("../db");

//metodo get para registro unico
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params; //capturar el id de la url
  const query = "SELECT * FROM CURSOS WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ Error: "error al obtrener el curso" });
    }
    if (result.length === 0) {
      return res.status(404).json({ Error: "curso no encontrado" });
    }
    res.json(result[0]); //devolver el primer registro encontrado
  });
});

//metodo get para multiples registros con paginacion y busqueda
router.get("/", verifyToken, (req, res) => {
  //obtener parametros de la URL
  const page = parseInt(req.query.page) || 1; //Pagina ;actual x defecto 1
  const limit = parseInt(req.query.limit) || 10; //limite de registros x defecto 10
  const cadena = req.query.cadena; //cadena de busqueda x defecto vacia
  let whereClause = "";
  let queryParams = [];
  if (cadena) {
    whereClause = "WHERE nombre LIKE ? or codigo LIKE ?";
    const searchTerm = `%${cadena}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  const offset = (page - 1) * limit; // el punto de inicio de la consulta
  //consultas para octenrer total de registros
  const countQuery = `SELECT COUNT(*) AS total FROM CURSOS ${whereClause}`;
  db.query(countQuery, queryParams, (err, countResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ Error: "error al obtrener los cursos" });
    }
    const totalCursos = countResult[0].total;
    const totalPages = Math.ceil(totalCursos / limit);
    //consulta para obtener los registros de la pagina
    const cursosQuery = `SELECT * FROM CURSOS ${whereClause} LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    db.query(cursosQuery, queryParams, (err, cursosResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ Error: "error al obtrener los cursos" });
      }
      //Envianr reapuesta con los datos de cursos y paginacion
      res.json({
        totalCursos: totalCursos,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        data: cursosResult,
      });
    });
  });
});

//metod post
router.post("/", verifyToken, (req, res) => {
  //obtener los datos
  const { nombre, paralelo, codigo, descripcion } = req.body;
  const search_query =
    "SELECT COUNT(*) AS CONTADOR FROM CURSOS WHERE codigo = ?";
  db.query(search_query, [codigo], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ Error: "Error interno al verificar el curso" });
    }
    if (result[0].CONTADOR > 0) {
      return res
        .status(409)
        .json({ Error: "El curso con codigo " + codigo + " ya existe" });
    }
    const query =
      "INSERT INTO CURSOS (id, nombre, paralelo, codigo, descripcion) VALUES (null,?, ?, ?, ?)";

    db.query(query, [nombre, paralelo, codigo, descripcion], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ Error: "error al crear el curso" });
      }
      res.status(201).json({
        message: "curso creado con exito",
        id: result.insertId,
      });
    });
  });
});

//metodo put
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { nombre, paralelo, codigo, descripcion } = req.body;
  const query =
    "UPDATE CURSOS SET nombre = ?, paralelo = ?, codigo = ?, descripcion = ? WHERE id = ?;";
  db.query(
    query,
    [nombre, paralelo, codigo, descripcion, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ Error: "error al actualizar el curso" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ Messaje: "curso no encontrado" });
      }
      res.json({ message: "curso actualizado con exito" });
    }
  );
});

//metodo delete
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const search_query =
    "SELECT COUNT(*) AS CONTADOR FROM clases WHERE curso_id = ?";
  db.query(search_query, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ Error: "Error interno al verificar a la clase" });
    }
    if (result[0].CONTADOR > 0) {
      return res
        .status(409)
        .json({
          Error: "El curso no se puede eliminar porque tiene clases asociadas",
        });
    }
    const query = "DELETE FROM CURSOS WHERE id = ?";
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ Error: "error al eliminar el curso" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ Messaje: "curso no encontrado" });
      }
      res.json({ message: "curso eliminado con exito" });
    });
  });
});

module.exports = router;
