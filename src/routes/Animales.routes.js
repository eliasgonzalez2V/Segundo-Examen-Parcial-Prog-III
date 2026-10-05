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
  obtenerAnimalPorCodigo,
  crearAnimal,
  actualizarAnimal,
  eliminarAnimal,
} from '../controllers/animal.controller.js';
import { logInfoCli, authToken, esAdmin } from '../middlewares/middlewares.js';

const router = express.Router();

// GET /api/animales -> listar todos
router.get('/', logInfoCli, obtenerAnimales);

// GET /api/animales/:id -> obtener uno
router.get('/:id',logInfoCli, obtenerAnimalPorId);

// GET /api/animales/codigo/:codigo -> obtener uno por código
router.get('/codigo/:codigo', logInfoCli, obtenerAnimalPorCodigo);

// POST /api/animales -> crear uno
router.post('/',logInfoCli, crearAnimal);

// PUT /api/animales/:id -> actualizar uno
router.put('/:id', logInfoCli, actualizarAnimal);

// DELETE /api/animales/:id -> eliminar uno
router.delete('/:id', logInfoCli, authToken, esAdmin, eliminarAnimal);

export default router;