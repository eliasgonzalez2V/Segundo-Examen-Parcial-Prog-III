// ============================================================
//  animal.controller.js — Controladores HTTP de Animales
// ============================================================
// Cada función de esta capa recibe directamente (req, res) y
// se registra como handler de Express. Acá vive la lógica que
// antes estaba repartida entre "funciones intermedias" y las
// rutas: lectura de req.params/req.body, validaciones, acceso a
// la base de datos y construcción de la respuesta HTTP.
//
// Las rutas de animales.routes.js solo deben invocar estas
// funciones; no deberían contener if/else de negocio ni
// llamadas directas a la base de datos.
// ============================================================

import { Animal } from "../models/Animal.js";
import { Seguimiento } from '../models/Seguimiento.js';

// ============================================================
//  obtenerAnimales — GET /api/animales
// ============================================================
// Devuelve todos los animales en formato seguro para el cliente.
// La clave queda oculta porque toJSON() no la incluye.
export const obtenerAnimales = async (_req, res, next) => {

  try {
    const animales = await Animal.find();
    // res.json llama a toJSON implícitamente, ocultando 'clave' y '__v'
    res.json(animales);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  obtenerAnimalPorId — GET /api/animales/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerAnimalPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const animal = await Animal.findById(id);
    if (!animal) {
      return res.status(404).json({ mensaje: "Animal no encontrado" });
    }

    res.json(animal);
  } catch (error) {
    // Delego el error al middleware global de errores para que lo maneje y devuelva la respuesta correcta
    next(error);
  }
};

// ============================================================
//  obtenerAnimalPorCodigo — GET /api/animales/codigo/:codigo
// ============================================================
// El código llega como string en req.params.codigo. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerAnimalPorCodigo = async (req, res, next) => {
  try {
    const { codigo } = req.params;

    const animal = await Animal.findOne({ codigo });
    if (!animal) {
      return res.status(404).json({ mensaje: "Animal no encontrado" });
    }

    res.json(animal);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  crearAnimal — POST /api/animales
// ============================================================
// El modelo Animal puede lanzar Error cuando los datos no
// pasan las validaciones. El controller traduce ese error a
// una respuesta HTTP 400 para el cliente.
export const crearAnimal = async (req, res, next) => {

  try {
    const { codigo, especie, clase, raza, origen, fechaNacimiento, perfil = {} } = req.body;

    // Mongoose maneja la unicidad por índice, pero validar aquí permite responder rápido
    const existente = await Animal.findOne({ codigo });
    if (existente) {
      return res.status(400).json({ mensaje: `Ya existe un animal con el código: ${codigo}` });
    }

    const nuevoAnimal = new Animal({
      codigo,
      especie,
      clase,
      raza,
      origen,
      fechaNacimiento,
      perfil,
    });

    const creado = await nuevoAnimal.save();

    console.log("¡Animal guardado con éxito en MongoDB!", creado._id);

    res.status(201).json(creado);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  actualizarAnimal — PUT /api/animales/:id
// ============================================================
// Conserva los campos anteriores cuando el cliente no envía
// alguno de ellos (operador ??). Vuelve a validar el animal
// completo antes de reemplazarlo.
export const actualizarAnimal = async (req, res, next) => {

  // Ya verificas que exista, o puedes dejar que el db.js lo maneje
  try {
    const { id } = req.params;
    const { codigo, especie, clase, raza, origen, fechaNacimiento, perfil } = req.body;

    const existente = await Animal.findById(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Animal no encontrado" });
    }

    //Validacion para que no modifiquen el codigo
    if (codigo !== undefined && codigo !== existente.codigo) {
      return res.status(400).json({
        mensaje: "El código del animal no puede cambiarse, ya que se perderia el historial clínico."
      });
    }

    // Construcción dinámica de actualizaciones parciales
    const datosActualizados = {
      // Siempre se mantiene el codigo
      codigo: existente.codigo,
      especie: especie !== undefined ? especie : existente.especie,
      clase: clase !== undefined ? clase : existente.clase,
      raza: raza !== undefined ? raza : existente.raza,
      origen: origen !== undefined ? origen : existente.origen,
      fechaNacimiento: fechaNacimiento !== undefined ? fechaNacimiento : existente.fechaNacimiento,

      // Para el subdocumento 'perfil' combinamos el spread operator (...) con ternarios 
      perfil: {
        ...existente.perfil, // Desparrama lo que ya tenía el perfil anterior
        ...(perfil?.nombre !== undefined && { nombre: perfil.nombre }),
        ...(perfil?.sexo !== undefined && { sexo: perfil.sexo }),
        ...(perfil?.color !== undefined && { color: perfil.color }),
        ...(perfil?.senias_particulares !== undefined && { senias_particulares: perfil.senias_particulares })
      }
    }

    const actualizado = await Animal.findByIdAndUpdate(
      id,
      { $set: datosActualizados },
      // Actualizado 'new: true' a 'returnDocument: "after"' por obsolescencia en Mongoose
      { returnDocument: 'after', runValidators: true }
    );

    res.json(actualizado);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  eliminarAnimal — DELETE /api/animales/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarAnimal = async (req, res, next) => {

  try {
    const { id } = req.params;

    // Chequeo de que exista el animal
    const eliminado = await Animal.findById(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Animal no encontrado" });
    }

    // Verificación de seguimientos medicos del animal
    const tieneSeguimientos = await Seguimiento.exists({ codigo: eliminado.codigo });

    if (tieneSeguimientos) {
      return res.status(400).json({
        mensaje: "No se puede eliminar el animal porque tiene seguimientos médicos asociados."
      });
    }

    // No posee seguimientos, puede ser eliminado
    await Animal.findByIdAndDelete(id);

    res.status(200).json({ mensaje: "Animal eliminado correctamente" });
    console.log("Animal eliminado (no posee seguimientos médicos asociados):", eliminado._id);
  } catch (error) {
    next(error);
  }
};
