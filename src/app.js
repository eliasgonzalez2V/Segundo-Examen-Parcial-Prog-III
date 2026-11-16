// --- Importaciones ---
//Importa lo que tengo en el .env
import 'dotenv/config';
// "express" es el framework web que nos da utilidades para
// manejar rutas, requests (peticiones) y responses (respuestas).
import express from 'express';
// "cors" (Cross-Origin Resource Sharing) es un middleware que
// PERMITE que el frontend (que vive en otro origen/dominio)
// pueda hacer peticiones a este backend. Sin esto, el navegador
// bloquearía las llamadas.
import cors from 'cors';

// Importa mongoose, para conectar con la BD de MongDB
import mongoose from 'mongoose';

// Importamos el "router" de usuarios. Cada router agrupa las
// rutas de un recurso. Acá podríamos sumar más routers.
import usuariosRoutes from './routes/usuarios.routes.js';
import animalesRoutes from './routes/animales.routes.js';
import estadoAnimalesRoutes from './routes/estadoanimales.routes.js';
import seguimientosRoutes from './routes/seguimientos.routes.js';

import { loginUsuario } from './controllers/usuario.controller.js';

// Middlewares de errores
import { manejarNoEncontrado, manejarErroresGlobales } from './middlewares/error.middlewares.js';

// Importamos la constante PORT desde nuestro archivo de config.
// Si existe la variable de entorno PORT la usa, si no, 3000.
//import { PORT } from '../.env';
const PORT = process.env.PORT;

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
app.use('/api/estados', estadoAnimalesRoutes);
app.use('/api/seguimientos', seguimientosRoutes);
// login
app.post('/api/login', loginUsuario);

// Middlewares de errores
app.use(manejarNoEncontrado);
app.use(manejarErroresGlobales);

// Conexión con la BD

// 1. Desactivamos el modo de consulta estricto de Mongoose para evitar
// avisos de obsolescencia (Deprecation Warnings) en versiones previas a v7.
mongoose.set('strictQuery', false);

// con esto verifico que en el env esten las variables de entorno obligatorias antes de 
// intentar conectar a la BD y que este jwt_secret para poder firmar los tokens. Si no están, corto el arranque con process.exit(1)
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("Error crítico: Faltan variables de entorno obligatorias (MONGO_URI o JWT_SECRET)");
  process.exit(1);
}

try {
  console.log("Intentando conectar a la base de datos...");

  // Agregamos serverSelectionTimeoutMS para que si falla o no la encuentra, 
  // tire error rápido en lugar de quedar intentando colgado en segundo plano.
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // 5 segundos
  });
  console.log('Base de datos conectada exitosamente a MongoDB Atlas');
  // --- Encender el servidor ---
  // app.listen(PORT, callback) pone al servidor a "escuchar"
  // peticiones TCP en el puerto indicado. El callback se
  // ejecuta una vez cuando el servidor está listo.
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
  });

} catch (e) {
  console.error('Error al conectar la BD', e.message);
  process.exit(1); // Corta el arranque si la BD no está disponible
}