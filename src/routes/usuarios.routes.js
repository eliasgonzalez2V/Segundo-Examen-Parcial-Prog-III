// ============================================================
//  usuarios.routes.js — Router de Usuarios
// ============================================================
// Las rutas solo montan los handlers de la capa controladora.
// No contienen lógica de negocio ni llamadas a la base de datos.
// ============================================================

import express from 'express';
import {
  loginUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuarioPorMail
} from '../controllers/usuario.controller.js';
import { logInfoCli, authToken, esAdmin } from '../middlewares/middlewares.js';

const router = express.Router();

router.post('/login', loginUsuario);

// GET /api/usuarios -> listar todos
router.get('/', obtenerUsuarios);

// GET /api/usuarios/:mail -> obtener uno
router.get('/mail/:mail', obtenerUsuarioPorMail);

// GET /api/usuarios/:id -> obtener uno
router.get('/:id', obtenerUsuarioPorId);

// POST /api/usuarios -> crear uno
router.post('/', /*logInfoCli,*/  crearUsuario);

// PUT /api/usuarios/:id -> actualizar uno
router.put('/:id', logInfoCli, authToken, actualizarUsuario);

// DELETE /api/usuarios/:id -> eliminar uno
router.delete('/:id', logInfoCli, authToken, esAdmin, eliminarUsuario);

export default router;