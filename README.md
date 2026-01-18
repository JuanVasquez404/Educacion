
# Backend Sistema de Educación

## Descripción
Backend en Node.js + Express para la gestión educativa, con autenticación JWT, inscripciones y conexión a MySQL.

## Estructura del Proyecto
```
backend/
├── server.js           # Servidor principal Express
├── db.js               # Conexión a MySQL
├── package.json        # Dependencias
├── routes/
│   ├── auth.js         # Rutas de autenticación
│   └── inscripciones.js# Rutas de inscripciones
├── utils/
│   └── auth.js         # Funciones JWT y auth
└── SQL/
    └── educacion.sql   # Script de BD
```

## Instalación y Configuración
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea `.env` en la raíz:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_contraseña_mysql
   DB_DATABASE=educacion
   JWT_SECRET=tu_clave_secreta_jwt
   ```
3. Crea la base de datos `educacion` y ejecuta `SQL/educacion.sql`.
4. Inicia el servidor:
   ```bash
   node server.js
   ```

## Dependencias
- express: Framework web
- cors: Middleware CORS
- dotenv: Variables de entorno
- bcrypt: Hash de contraseñas
- jsonwebtoken: JWT
- mysql, mysql2: Cliente MySQL
- **server.js**: Configura Express, rutas y puerto
- **db.js**: Conexión y exportación de MySQL
- **utils/auth.js**: Funciones JWT y middleware de autenticación

## Endpoints de la API

### Autenticación
#### POST `/api/auth/login`
Autentica un profesor.
**Body:**
```json
{
  "username": "nombre_profesor",
  "password": "contraseña"
}
```
**Respuesta exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "jwt_token_here"
}
```
**Error (401):**
```json
{
  "message": "Usuario o contraseña incorrectos"
}
```

### Inscripciones (protegidas)
Todos los endpoints requieren header:
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/inscripciones/:id`
Obtiene inscripción por ID.
**Respuesta (200):**
```json
{
  "id": 1,
  "estudiante_id": 1,
  "curso_id": 1,
  "fecha": "2025-01-15",
  "observacion": "Comentarios adicionales"
}
```

#### POST `/api/inscripciones`
Crea una inscripción.
**Body:**
```json
{
  "estudiante_id": 1,
  "nombre_estudiante": "Juan",
  "apellido_estudiante": "Pérez",
  "curso_id": 2,
  "fecha": "2025-10-15",
  "observacion": "Inscripción especial"
}
```
**Respuesta (201):**
```json
{
  "message": "Inscripción creada exitosamente",
  "id": 10,
  "inscripcion": {
    "estudiante_id": "",
    "nombre_estudiante": "",
    "apellido_estudiante": "",
    "curso_id": ,
    "fecha": "",
    "observacion": ""
  }
}
```
**Error (400):**
```json
{
  "message": "Datos de inscripción inválidos"
}
```

#### GET `/api/inscripciones?page=1&limit=10&cadena=busqueda`
Lista paginada de inscripciones.
**Query:**
- `page`: Página (default: 1)
- `limit`: Registros por página (default: 10)
- `cadena`: Filtro de búsqueda por ID de estudiante o curso (opcional)
**Respuesta (200):**
```json
{
  "totalItems": 50,
  "totalPages": 5,
  "currentPage": 1,
  "perPage": 10,
  "data": [
    {
      "id": 1,
      "estudiante_id": 1,
      "curso_id": 1,
      "fecha": "2025-01-15",
      "observacion": "Comentarios"
    }
  ]
}
```

#### PUT `/api/inscripciones/:id`
Actualiza una inscripción existente.
**Body:**
```json
{
  "estudiante_id": 1,
  "nombre_estudiante": "Juan",
  "apellido_estudiante": "Pérez",
  "curso_id": 2,
  "fecha": "2025-10-15",
  "observacion": "Actualización de observación"
}
```
**Respuesta (200):**
```json
{
  "message": "inscripción actualizada con éxito"
}
```
**Error (404):**
```json
{
  "Messaje": "inscripción no encontrada"
}
```

#### DELETE `/api/inscripciones/:id`
Elimina una inscripción.
**Respuesta (200):**
```json
{
  "message": "inscripción eliminada con éxito"
}
```
**Error (409):**
```json
{
  "Messaje": "Inscripción no se puede eliminar por que depente de otras tabla"
}
```
**Error (404):**
```json
{
  "Messaje": "inscripción no encontrada"
}
```

## Esquema de Base de Datos
Tablas principales:
- profesores: Docentes (con contraseña hasheada)
- estudiantes: Alumnos
- cursos: Catálogo de cursos
- inscripciones: Relación estudiante-curso, incluye:
  - estudiante_id (int, obligatorio)
  - nombre_estudiante (varchar, opcional)
  - apellido_estudiante (varchar, opcional)
  - curso_id (int, obligatorio)
  - fecha (date, obligatorio)
  - observacion (text, opcional)
- clases: Asignación profesor-curso
- calificaciones: Notas y comentarios

## Seguridad
- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Tokens expiran en 1 hora
- Middleware de verificación en rutas protegidas

## Próximos pasos
- CRUD completo para todas las entidades
- Validación de datos
- Refresh tokens
- Logging y manejo de errores
- Paginación en todas las consultas
- Endpoints para estudiantes
- Sistema de roles y permisos
