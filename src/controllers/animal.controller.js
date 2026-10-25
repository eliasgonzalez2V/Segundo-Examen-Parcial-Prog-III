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

// ============================================================
//  obtenerAnimales — GET /api/animales
// ============================================================
// Devuelve todos los animales en formato seguro para el cliente.
// La clave queda oculta porque toJSON() no la incluye.
export const obtenerAnimales = async (_req, res) => {
 
  try {
      const animales = await Animal.find();
      // res.json llama a toJSON implícitamente, ocultando 'clave' y '__v'
      res.json(animales);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
};

// ============================================================
//  obtenerAnimalPorId — GET /api/animales/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerAnimalPorId = async (req, res) => {
  try {
      const { id } = req.params;
  
      const animal = await Animal.findById(id);
      if (!animal) {
        return res.status(404).json({ mensaje: "Animal no encontrado" });
      }
  
      res.json(animal);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
};

// ============================================================
//  obtenerAnimalPorCodigo — GET /api/animales/codigo/:codigo
// ============================================================
// El código llega como string en req.params.codigo. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerAnimalPorCodigo = async (req, res) => {
  try {
      const { codigo } = req.params;
  
      const animal = await Animal.findOne({ codigo });
      if (!animal) {
        return res.status(404).json({ mensaje: "Animal no encontrado" });
      }
  
      res.json(animal);
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
};

// ============================================================
//  crearAnimal — POST /api/animales
// ============================================================
// El modelo Animal puede lanzar Error cuando los datos no
// pasan las validaciones. El controller traduce ese error a
// una respuesta HTTP 400 para el cliente.
export const crearAnimal = async (req, res) => {
  
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
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  actualizarAnimal — PUT /api/animales/:id
// ============================================================
// Conserva los campos anteriores cuando el cliente no envía
// alguno de ellos (operador ??). Vuelve a validar el animal
// completo antes de reemplazarlo.
export const actualizarAnimal = async (req, res) => {
  
  // Ya verificas que exista, o puedes dejar que el db.js lo maneje
    try {
      const { id } = req.params;
      const { codigo, especie, clase, raza, origen, fechaNacimiento, perfil } = req.body;
  
      const existente = await Animal.findById(id);
      if (!existente) {
        return res.status(404).json({ mensaje: "Animal no encontrado" });
      }
  
      // Construcción dinámica de actualizaciones parciales
      const datosActualizados = {codigo: codigo !== undefined ? codigo : existente.codigo,
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
      res.status(400).json({ mensaje: error.message });
    }
};

// ============================================================
//  eliminarAnimal — DELETE /api/animales/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarAnimal = async (req, res) => {
  
    try {
      const { id } = req.params;
  
      const eliminado = await Animal.findByIdAndDelete(id);
      if (!eliminado) {
        return res.status(404).json({ mensaje: "Animal no encontrado" });
      }
  
      res.status(204).send();
      console.log("Animal eliminado");
    } catch (error) {
      res.status(500).json({ mensaje: error.message });
    }
};
