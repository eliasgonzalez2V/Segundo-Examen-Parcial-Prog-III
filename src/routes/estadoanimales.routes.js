// ============================================================
//  estadoanimales.routes.js — Router de Estados de Animales
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  obtenerEstadoAnimales,
  obtenerEstadoAnimalPorId,
  obtenerEstadoAnimalPorCodigo,
  crearEstadoAnimal,
  actualizarEstadoAnimal,
  eliminarEstadoAnimal,
} from '../controllers/estadoanimal.controller.js';
import { logInfoCli, authToken, esAdmin } from '../middlewares/middlewares.js';

const router = express.Router();

// GET /api/estados -> listar todos
router.get('/', logInfoCli, obtenerEstadoAnimales);

// GET /api/estados/:id -> obtener uno por ID
router.get('/:id', logInfoCli, obtenerEstadoAnimalPorId);

// GET /api/estados/codigo/:codigo -> obtener uno por código
router.get('/codigo/:codigo', logInfoCli, obtenerEstadoAnimalPorCodigo);

// POST /api/estados -> crear uno
router.post('/',logInfoCli, crearEstadoAnimal);

// PUT /api/estados/:id -> actualizar uno
router.put('/:id', logInfoCli, actualizarEstadoAnimal);

// DELETE /api/estados/:id -> eliminar uno
router.delete('/:id', logInfoCli,/* authToken, esAdmin, */eliminarEstadoAnimal);

export default router;