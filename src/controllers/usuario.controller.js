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
import bcrypt from "bcrypt"

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
//  obtenerUsuarioPorMail — GET /api/usuarios/:mail
// ============================================================
// El mail llega como string en req.params.mail. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerUsuarioPorMail = (req, res) => {
  const usuario = db.getUsuarioByMail(req.params.mail);

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
export const crearUsuario = async (req, res) => {
  
  try {
    const { mail, password, ...otrosCampos } = req.body;

    const user = await db.getUsuarioByMail(mail);
    if (user) {
      return res.status(400).json({ mensaje: "ya existe un usuario con este mail: " + mail });
    }

    const usuario = new Usuario({ mail, password, ...otrosCampos });
    const creado = await db.createUsuario(usuario);
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
  // Ya verificas que exista, o puedes dejar que el db.js lo maneje
  const actualizado = db.updateUsuario(req.params.id, req.body);

  if (!actualizado) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  res.json(actualizado.toJSON());
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

// ============================================================
//  loginUsuario — POST /api/usuarios/login
// ============================================================
export const loginUsuario = async (req, res) => {
  try {
    const { mail, password } = req.body;

    // Validación básica de campos requeridos
    if (!mail || !password) {
      return res.status(400).json({ mensaje: "El mail y la clave son obligatorios" });
    }

    // 1. Buscar usuario por mail en el modelo
    const usuario = db.getUsuarioByMail(mail);

    // Si no existe el usuario, responder 401
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // 2. Comparar la clave ingresada con el hash guardado en la base de datos
    const esClaveValida = await bcrypt.compare(password, usuario.password);
console.log(password);
console.log(usuario.password);
    if (!esClaveValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // 3. Generar el JWT con el payload del usuario
    const SECRET_KEY = process.env.JWT_SECRET || 'claveblablabla';

    const token = jwt.sign(
      { id: usuario._id || usuario.id, rol: usuario.rol },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // 4. Responder con éxito
    return res.json({
      mensaje: "Login exitoso",
      token
    });

  } catch (error) {
    console.error('Error en loginUsuario:', error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }

};
