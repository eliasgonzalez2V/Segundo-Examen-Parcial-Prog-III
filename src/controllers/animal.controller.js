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

import { db } from "../config/db.js";
import { Animal } from "../models/Animal.js";

// ============================================================
//  obtenerAnimales — GET /api/animales
// ============================================================
// Devuelve todos los animales en formato seguro para el cliente.
// La clave queda oculta porque toJSON() no la incluye.
export const obtenerAnimales = (req, res) => {
  res.json(db.getAnimales().map((animal) => animal.toJSON()));
};

// ============================================================
//  obtenerAnimalPorId — GET /api/animales/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerAnimalPorId = (req, res) => {
  const animal = db.getAnimalById(req.params.id);

  if (!animal) {
    return res.status(404).json({ mensaje: "Animal no encontrado" });
  }

  res.json(animal.toJSON());
};

// ============================================================
//  obtenerAnimalPorCodigo — GET /api/animales/codigo/:codigo
// ============================================================
// El código llega como string en req.params.codigo. Si no existe, la
// capa controladora responde 404; si existe, responde 200.
export const obtenerAnimalPorCodigo = (req, res) => {
  const animal = db.getAnimalByCodigo(req.params.codigo);

  if (!animal) {
    return res.status(404).json({ mensaje: "Animal no encontrado" });
  }

  res.json(animal.toJSON());
};

// ============================================================
//  crearAnimal — POST /api/animales
// ============================================================
// El modelo Animal puede lanzar Error cuando los datos no
// pasan las validaciones. El controller traduce ese error a
// una respuesta HTTP 400 para el cliente.
export const crearAnimal = async (req, res) => {
  
  try {
    const {codigo, ...otrosCampos} = req.body;
    
    const animalExistente = db.getAnimalByCodigo(codigo);
    if (animalExistente) {
      return res.status(400).json({ mensaje: "ya existe un animal con este código: " + codigo });
    }
    const animal = new Animal({codigo, ...otrosCampos});
    const creado = await db.createAnimal(animal);
    res.status(201).json(creado.toJSON());
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
export const actualizarAnimal = (req, res) => {
  const existente = db.getAnimalById(req.params.id);

  if (!existente) {
    return res.status(404).json({ mensaje: "Animal no encontrado" });
  }

  try {
    const datosActualizados = {
      codigo: req.body.codigo ?? existente.codigo,
      especie: req.body.especie ?? existente.especie,
      raza: req.body.raza ?? existente.raza,
      perfil: req.body.perfil ?? existente.perfil,
    };
    const animal = new Animal(datosActualizados);
    animal.setId(req.params.id);
    const actualizado = db.updateAnimal(req.params.id, animal);
    res.json(actualizado.toJSON());
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// ============================================================
//  eliminarAnimal — DELETE /api/animales/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarAnimal = (req, res) => {
  const eliminado = db.deleteAnimal(req.params.id);

  if (!eliminado) {
    return res.status(404).json({ mensaje: "Animal no encontrado" });
  }

  res.status(204).send();
};
;
