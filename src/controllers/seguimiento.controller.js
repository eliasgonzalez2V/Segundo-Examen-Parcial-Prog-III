// ============================================================
//  seguimiento.controller.js — Controladores HTTP de Seguimientos
// ============================================================
// Cada función de esta capa recibe directamente (req, res) y
// se registra como handler de Express. Acá vive la lógica de
// lectura de req.params/req.body, validaciones, acceso a
// la base de datos y construcción de la respuesta HTTP.
//
// Las rutas de seguimientos.routes.js solo deben invocar estas
// funciones;
// ============================================================

import { Seguimiento } from "../models/Seguimiento.js";
import { Animal } from "../models/Animal.js";

// ============================================================
//  obtenerSeguimientos — GET /api/seguimientos
// ============================================================
// Devuelve todos los registros de seguimiento con la info del animal poblada.
export const obtenerSeguimientos = async (_req, res) => {
  try {
    const seguimientos = await Seguimiento.find().populate('animalInfo');
    res.json(seguimientos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerSeguimientoPorId — GET /api/seguimientos/:id
// ============================================================
// El id del seguimiento llega en req.params.id. Si no existe, responde 404.
export const obtenerSeguimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const seguimiento = await Seguimiento.findById(id).populate('animalInfo');
    if (!seguimiento) {
      return res.status(404).json({ mensaje: "Seguimiento de animal no encontrado" });
    }

    res.json(seguimiento);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerSeguimientosPorCodigo — GET /api/seguimientos/codigo/:codigo
// ============================================================
// Devuelve el historial completo de controles de un animal según su código 
// (relación 1 a muchos).
export const obtenerSeguimientosPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const seguimientos = await Seguimiento.find({ codigo }).populate('animalInfo');
    if (seguimientos.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron seguimientos para el código proporcionado" });
    }

    res.json(seguimientos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  crearSeguimiento — POST /api/seguimientos
// ============================================================
// Valida que el animal exista antes de registrarle un control/seguimiento.
export const crearSeguimiento = async (req, res) => {
  try {
    const { codigo, fecha_control, peso, altura, observaciones } = req.body;

    // Verificamos que el animal exista en la colección 'Animales' antes de guardar
    const animalExiste = await Animal.findOne({ codigo });
    if (!animalExiste) {
      return res.status(404).json({ mensaje: `No existe un animal registrado con el código: ${codigo}` });
    }

    const nuevoSeguimiento = new Seguimiento({
      codigo,
      fecha_control,
      peso,
      altura,
      observaciones,
    });

    const creado = await nuevoSeguimiento.save();
    
    // Poblamos la info del animal antes de responder para que el cliente lo reciba completo
    await creado.populate('animalInfo');

    console.log("¡Seguimiento guardado con éxito en MongoDB!", creado._id);

    res.status(201).json(creado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  actualizarSeguimiento — PUT /api/seguimientos/:id
// ============================================================
// Actualiza de forma parcial o total un registro de seguimiento existente.
export const actualizarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, fecha_control, peso, altura, observaciones } = req.body;

    const existente = await Seguimiento.findById(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Seguimiento de animal no encontrado" });
    }

    // Si envían un nuevo código, validamos que exista en el modelo Animal
    if (codigo !== undefined && codigo !== existente.codigo) {
      const animalExiste = await Animal.findOne({ codigo });
      if (!animalExiste) {
        return res.status(404).json({ mensaje: `No existe un animal registrado con el código: ${codigo}` });
      }
    }

    // Construcción dinámica de actualizaciones parciales
    const datosActualizados = {};

    if (codigo !== undefined) datosActualizados.codigo = codigo;
    if (fecha_control !== undefined) datosActualizados.fecha_control = fecha_control;
    if (peso !== undefined) datosActualizados.peso = peso;
    if (altura !== undefined) datosActualizados.altura = altura;
    if (observaciones !== undefined) datosActualizados.observaciones = observaciones;

    const actualizado = await Seguimiento.findByIdAndUpdate(
      id,
      { $set: datosActualizados },
      { returnDocument: 'after', runValidators: true }
    ).populate('animalInfo');

    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  eliminarSeguimiento — DELETE /api/seguimientos/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Seguimiento.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Seguimiento de animal no encontrado" });
    }

    res.status(204).send();
    console.log("Seguimiento de animal eliminado");
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};