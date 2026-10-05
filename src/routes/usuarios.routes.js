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
router.get('/', authToken, esAdmin, obtenerUsuarios);

// GET /api/usuarios/:mail -> obtener uno
router.get('/mail/:mail', authToken, esAdmin, obtenerUsuarioPorMail);

// GET /api/usuarios/:id -> obtener uno
router.get('/:id', authToken, esAdmin, obtenerUsuarioPorId);

// POST /api/usuarios -> crear uno
router.post('/', authToken, esAdmin, crearUsuario);

// PUT /api/usuarios/:id -> actualizar uno
router.put('/:id', authToken, esAdmin, actualizarUsuario);

// DELETE /api/usuarios/:id -> eliminar uno
router.delete('/:id', authToken, esAdmin, eliminarUsuario);

export default router;