// ============================================================
//  usuario.controller.js — Controladores HTTP de Usuarios
// ============================================================
// Cada función de esta capa recibe directamente (req, res) y
// se registra como handler de Express. Acá vive la lógica que
// antes estaba repartida entre "funciones intermedias" y las
// rutas: lectura de req.params/req.body, validaciones, acceso a
// la base de datos y construcción de la respuesta HTTP.
//
// Las rutas de usuarios.routes.js solo deben invocar estas
// funciones; no deberían contener if/else de negocio ni
// llamadas directas a la base de datos.
// ============================================================

import { db } from "../config/db.js";
import { Usuario } from "../models/Usuario.js";
import jwt from "jsonwebtoken";

// ============================================================
//  obtenerUsuarios — GET /api/usuarios
// ============================================================
// Devuelve todos los usuarios en formato seguro para el cliente.
// La clave queda oculta porque toJSON() no la incluye.
export const obtenerUsuarios = (req, res) => {
  res.json(db.getUsuarios().map((usuario) => usuario.toJSON()));
};

// ============================================================
//  obtenerUsuarioPorId — GET /api/usuarios/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerUsuarioPorId = (req, res) => {
  const usuario = db.getUsuarioById(req.params.id);

  if (!usuario) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  res.json(usuario.toJSON());
};

// ============================================================
//  crearUsuario — POST /api/usuarios
// ============================================================
// El modelo Usuario puede lanzar Error cuando los datos no
// pasan las validaciones. El controller traduce ese error a
// una respuesta HTTP 400 para el cliente.
export const crearUsuario = (req, res) => {
  try {
    const usuario = new Usuario(req.body);
    const creado = db.createUsuario(usuario);
    res.status(201).json(creado.toJSON());
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  actualizarUsuario — PUT /api/usuarios/:id
// ============================================================
// Conserva los campos anteriores cuando el cliente no envía
// alguno de ellos (operador ??). Vuelve a validar el usuario
// completo antes de reemplazarlo.
export const actualizarUsuario = (req, res) => {
  const existente = db.getUsuarioById(req.params.id);

  if (!existente) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  try {
    const datosActualizados = {
      mail: req.body.mail ?? existente.mail,
      password: req.body.password ?? existente.password,
      rol: req.body.rol ?? existente.rol,
      perfil: req.body.perfil ?? existente.perfil,
    };
    const usuario = new Usuario(datosActualizados);
    usuario.setId(req.params.id);
    const actualizado = db.updateUsuario(req.params.id, usuario);
    res.json(actualizado.toJSON());
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  eliminarUsuario — DELETE /api/usuarios/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarUsuario = (req, res) => {
  const eliminado = db.deleteUsuario(req.params.id);

  if (!eliminado) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  res.status(204).send();
};

export const loginUsuario = async (req, res) => {
  const { mail, password } = req.body;
  // 1. Buscar usuario en el Model...
  // 2. Comparar contraseña con bcrypt.compare(password, usuario.password)

  // 3. Si es válido, generar el JWT
  const token = jwt.sign(
    //{ id: usuario._id, role: usuario.role },
    {id: 1, role: 'ADMIN'},
    // process.env.JWT_SECRET,
    "claveblablabla",
    { expiresIn: "15000" },
  );

  res.json({ message: "Login exitoso", token });
};
