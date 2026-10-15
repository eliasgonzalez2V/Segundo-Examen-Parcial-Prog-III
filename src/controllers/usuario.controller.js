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

import { Usuario } from "../models/Usuario.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10;

// ============================================================
//  obtenerUsuarios — GET /api/usuarios
// ============================================================
// Devuelve todos los usuarios en formato seguro para el cliente.
// La clave queda oculta porque toJSON() no la incluye.
export const obtenerUsuarios = async (_req, res) => {
  try {
    const usuarios = await Usuario.find();
    // res.json llama a toJSON implícitamente, ocultando 'clave' y '__v'
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerUsuarioPorId — GET /api/usuarios/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usu = await Usuario.findById(id);
    if (!usu) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usu);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerUsuarioPorMail — GET /api/usuarios/:mail
// ============================================================
// El mail llega como string en req.params.mail. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerUsuarioPorMail = async (req, res) => {
  try {
    const { mail } = req.params;

    const usu = await Usuario.findOne({ mail });
    if (!usu) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usu);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  crearUsuario — POST /api/usuarios
// ============================================================
// El modelo Usuario puede lanzar Error cuando los datos no
// pasan las validaciones. El controller traduce ese error a
// una respuesta HTTP 400 para el cliente.
export const crearUsuario = async (req, res) => {

  try {
    const { mail, password, rol = 'VETER', perfil = {} } = req.body;

    // Mongoose maneja la unicidad por índice, pero validar aquí permite responder rápido
    const existente = await Usuario.findOne({ mail });
    if (existente) {
      return res.status(400).json({ mensaje: `Ya existe un usuario con el mail: ${mail}` });
    }

    const claveHasheada = await bcrypt.hash(password, SALT_ROUNDS);

    const nuevoUsuario = new Usuario({
      mail,
      password: claveHasheada,
      rol,
      perfil,
    });

    const creado = await nuevoUsuario.save();

    console.log("¡Usuario guardado con éxito en MongoDB!", creado._id);

    res.status(201).json(creado);
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
export const actualizarUsuario = async (req, res) => {
  // Ya verificas que exista, o puedes dejar que el db.js lo maneje
  try {
    const { id } = req.params;
    const { mail, rol, perfil, password } = req.body;

    const existente = await Usuario.findById(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Construcción dinámica de actualizaciones parciales
    const datosActualizados = {};

    if (mail !== undefined) datosActualizados.mail = mail;
    if (rol !== undefined) datosActualizados.rol = rol;

    // Preserva subdocumento 'perfil' sin sobreescribir propiedades no enviadas
    if (perfil) {
      if (perfil.nombre !== undefined) datosActualizados['perfil.nombre'] = perfil.nombre;
      if (perfil.apellido !== undefined) datosActualizados['perfil.apellido'] = perfil.apellido;
      if (perfil.foto !== undefined) datosActualizados['perfil.foto'] = perfil.foto;
    }

    // Re-hashear clave solo si se provee una nueva
    if (clave) {
      datosActualizados.clave = await bcrypt.hash(clave, SALT_ROUNDS);
    }

    const actualizado = await Usuario.findByIdAndUpdate(
      id,
      { $set: datosActualizados },
      { new: true, runValidators: true }
    );

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  eliminarUsuario — DELETE /api/usuarios/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarUsuario = async (req, res) => {

  try {
    const { id } = req.params;

    const eliminado = await Usuario.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
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

    // Recupear campo con 'select: false' usando '+password'
    const usu = await Usuario.findOne({ mail }).select('+password');
    if (!usu) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }
    //const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const esClaveValida = await bcrypt.compare(password, usu.password);
    console.log(esClaveValida);

    if (!esClaveValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }
  
    // 3. Generar el JWT con el payload del usuario
    const SECRET_KEY = process.env.JWT_SECRET;
    console.log(SECRET_KEY);

    const token = jwt.sign(
      { id: usu._id, rol: usu.rol },
      SECRET_KEY,
      { expiresIn: "20000" }
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
