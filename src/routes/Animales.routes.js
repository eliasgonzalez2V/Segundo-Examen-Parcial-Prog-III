// ============================================================
//  animales.routes.js — Router de Animales
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  obtenerAnimales,
  obtenerAnimalPorId,
  crearAnimal,
  actualizarAnimal,
  eliminarAnimal,
} from '../controllers/animal.controller.js';

const router = express.Router();

// GET /api/animales -> listar todos
router.get('/', obtenerAnimales);

// GET /api/animales/:id -> obtener uno
router.get('/:id', obtenerAnimalPorId);

// POST /api/animales -> crear uno
router.post('/', crearAnimal);

// PUT /api/animales/:id -> actualizar uno
router.put('/:id', actualizarAnimal);

// DELETE /api/animales/:id -> eliminar uno
router.delete('/:id', eliminarAnimal);

export default router;