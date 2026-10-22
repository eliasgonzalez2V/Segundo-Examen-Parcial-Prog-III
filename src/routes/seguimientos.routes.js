// ============================================================
//  seguimientos.routes.js — Router de Seguimientos de Animales
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  obtenerSeguimientos,
  obtenerSeguimientoPorId,
  obtenerSeguimientosPorCodigo,
  crearSeguimiento,
  actualizarSeguimiento,
  eliminarSeguimiento,
} from '../controllers/seguimiento.controller.js';
import { logInfoCli, authToken, esAdmin } from '../middlewares/middlewares.js';

const router = express.Router();

// GET /api/seguimientos -> listar todos los seguimientos
router.get('/', logInfoCli, obtenerSeguimientos);

// GET /api/seguimientos/:id -> obtener un seguimiento específico por su ID
router.get('/:id', logInfoCli, obtenerSeguimientoPorId);

// GET /api/seguimientos/codigo/:codigo -> obtener el historial de seguimientos de un animal por su código
router.get('/codigo/:codigo', logInfoCli, obtenerSeguimientosPorCodigo);

// POST /api/seguimientos -> registrar un nuevo control/seguimiento
router.post('/', logInfoCli, crearSeguimiento);

// PUT /api/seguimientos/:id -> actualizar un seguimiento por su ID
router.put('/:id', logInfoCli, actualizarSeguimiento);

// DELETE /api/seguimientos/:id -> eliminar un seguimiento por su ID
router.delete('/:id', logInfoCli, /* authToken, esAdmin, */ eliminarSeguimiento);

export default router;