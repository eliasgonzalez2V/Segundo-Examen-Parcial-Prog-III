// Manejador para rutas inexistentes (404)
export const manejarNoEncontrado = (req, res, next) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
};

// Middleware global de errores clasificados (400, 401, 403, 409, 500)
export const manejarErroresGlobales = (err, req, res, next) => {

  //Aca se ve que le llega
  console.log("--- OBJETO DE ERROR RECIBIDO ---", {
    name: err.name,
    code: err.code,
    status: err.status,
    message: err.message
  });

  // 400: JSON mal formado en el body de la petición
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ mensaje: "JSON inválido o mal formado" });
  }

  // 400: ID de Mongoose mal formado (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: "ID mal formado o inválido" });
  }

  // 409: Conflicto por clave duplicada en MongoDB (ej. registro único repetido)
  if (err.code === 11000) {
    return res.status(409).json({ mensaje: "Conflicto: El recurso (email, documento, etc.) ya se encuentra registrado" });
  }

  // 401: Errores relacionados con el Token JWT (inválido o vencido)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ mensaje: "No autorizado: Token inválido o expirado" });
  }

  // 403: Acceso prohibido por falta de permisos o rol insuficiente
  if (err.status === 403 || err.name === 'ForbiddenError') {
    return res.status(403).json({ mensaje: "Acceso prohibido: No tenés los permisos necesarios para esta acción" });
  }

  // 500: Error interno no controlado del servidor
  console.error('Error interno no controlado:', err);
  res.status(500).json({ mensaje: "Error interno del servidor" });
};