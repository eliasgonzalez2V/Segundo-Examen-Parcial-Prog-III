// ============================================================
//  estadoanimal.controller.js — Controladores HTTP de Estados de Animales
// ============================================================
// Cada función de esta capa recibe directamente (req, res) y
// se registra como handler de Express. Acá vive la lógica de
// lectura de req.params/req.body, validaciones, acceso a
// la base de datos y construcción de la respuesta HTTP.
//
// Las rutas de estadoanimales.routes.js solo deben invocar estas
// funciones;
// ============================================================

import { EstadoAnimal } from "../models/EstadoAnimal.js";
import { Animal } from "../models/Animal.js";

// ============================================================
//  obtenerEstadoAnimales — GET /api/estados
// ============================================================
// Devuelve todos los registros de estado con la info del animal poblada.
export const obtenerEstadoAnimales = async (_req, res) => {
  try {
    const estados = await EstadoAnimal.find().populate('animalInfo');
    res.json(estados);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerEstadoAnimalPorId — GET /api/estados/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, responde 404.
export const obtenerEstadoAnimalPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const estado = await EstadoAnimal.findById(id).populate('animalInfo');
    if (!estado) {
      return res.status(404).json({ mensaje: "Estado de animal no encontrado" });
    }

    res.json(estado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ============================================================
//  obtenerEstadoAnimalPorCodigo — GET /api/estados/codigo/:codigo
// ============================================================
// Busca un estado utilizando el código del animal.
export const obtenerEstadoAnimalPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    // Nota Mental: find({ codigo }) si hay varios registros por código 
    // listara todos los movimientos de un animal, 
    // o se puede usar findOne({ codigo }) y te traerá el primero.
    const estado = await EstadoAnimal.find({ codigo }).populate('animalInfo');
    if (!estado) {
      return res.status(404).json({ mensaje: "No se encontró un estado para el código proporcionado" });
    }

    res.json(estado);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};


// ============================================================
//  crearEstadoAnimal — POST /api/estados
// ============================================================
// Valida que el animal exista antes de registrarle un estado.
export const crearEstadoAnimal = async (req, res) => {
  try {
    const { codigo, fecha_ingreso, estado, fecha_egreso, descripcion } = req.body;

    // Verificamos opcionalmente que el animal exista en la colección 'Animales'
    const animalExiste = await Animal.findOne({ codigo });
    if (!animalExiste) {
      return res.status(404).json({ mensaje: `No existe un animal registrado con el código: ${codigo}` });
    }

    const nuevoEstadoAnimal = new EstadoAnimal({
      codigo,
      fecha_ingreso,
      estado,
      fecha_egreso,
      descripcion,
    });

    const creado = await nuevoEstadoAnimal.save();
    
    // Poblamos la info del animal (cruzar información entre colecciones)
    // antes de responder para que el cliente lo reciba completo
    await creado.populate('animalInfo');

    console.log("¡Estado de animal guardado con éxito en MongoDB!", creado.codigo);

    res.status(201).json(creado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  actualizarEstadoAnimal — PUT /api/estados/:id
// ============================================================
// Actualiza de forma parcial o total un registro de estado.
export const actualizarEstadoAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, fecha_ingreso, estado, fecha_egreso, descripcion } = req.body;

    const existente = await EstadoAnimal.findById(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Estado de animal no encontrado" });
    }

    // Si envían un nuevo código, validamos que exista en el modelo Animal
    if (codigo !== undefined && codigo !== existente.codigo) {
      const animalExiste = await Animal.findOne({ codigo });
      if (!animalExiste) {
        return res.status(404).json({ mensaje: `No existe un animal registrado con el código: ${codigo}` });
      }
    }

    // Construcción dinámica limpia usando el spread operator
    const datosActualizados = {
      ...(codigo !== undefined && { codigo }),
      ...(fecha_ingreso !== undefined && { fecha_ingreso }),
      ...(estado !== undefined && { estado }),
      ...(fecha_egreso !== undefined && { fecha_egreso }),
      ...(descripcion !== undefined && { descripcion })
    };

    const actualizado = await EstadoAnimal.findByIdAndUpdate(
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
//  eliminarEstadoAnimal — DELETE /api/estados/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarEstadoAnimal = async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await EstadoAnimal.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Estado de animal no encontrado" });
    }

    res.status(204).send();
    console.log("Estado de animal eliminado");
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};