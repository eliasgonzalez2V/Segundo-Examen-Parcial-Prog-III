// --- Importaciones ---
// "express" es el framework web que nos da utilidades para
// manejar rutas, requests (peticiones) y responses (respuestas).
import express from 'express';
// "cors" (Cross-Origin Resource Sharing) es un middleware que
// PERMITE que el frontend (que vive en otro origen/dominio)
// pueda hacer peticiones a este backend. Sin esto, el navegador
// bloquearía las llamadas.
import cors from 'cors';

// Importamos el "router" de usuarios. Cada router agrupa las
// rutas de un recurso. Acá podríamos sumar más routers.
import usuariosRoutes from './routes/usuarios.routes.js';
import animalesRoutes from './routes/animales.routes.js';
import {loginUsuario} from './controllers/usuario.controller.js';

// Importamos la constante PORT desde nuestro archivo de config.
// Si existe la variable de entorno PORT la usa, si no, 3000.
import { PORT } from './config/env.js';

// --- Creación de la app ---
// express() devuelve un objeto "app" que representa al servidor.
// Sobre ese objeto vamos a registrar middlewares y rutas.
const app = express();

// --- Middlewares globales ---
// app.use() registra un middleware: una función que se ejecuta
// para CADA request entrante, en el orden en que los pongamos.

// Habilita CORS para todos los orígenes. En producción habría
// que restringirlo solo al dominio del frontend.
app.use(cors());

// express.json() parsea el body de las peticiones cuando vienen
// en formato JSON (Content-Type: application/json) y los deja
// disponibles en req.body. Sin esto, req.body sería undefined.
app.use(express.json());

// --- Ruta "raíz" ---
// Un endpoint simple para verificar que la API está viva.
// Si vas a http://localhost:3000/ ves el mensaje.
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Rescate Animal funcionando' });
});

// --- Montaje de rutas ---
// Cada router se monta con un prefijo distinto. Express
// redirige lo que matchee al router correspondiente.
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/animales', animalesRoutes);
// login
app.post('/api/login', loginUsuario);


// --- Encender el servidor ---
// app.listen(PORT, callback) pone al servidor a "escuchar"
// peticiones TCP en el puerto indicado. El callback se
// ejecuta una vez cuando el servidor está listo.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});