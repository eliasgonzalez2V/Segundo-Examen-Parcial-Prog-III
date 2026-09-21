// ============================================================
//  env.js — Configuración central de variables de entorno
// ============================================================
// Acá leemos el archivo ".env" y exponemos los valores como
// constantes. Así, en vez de escribir "process.env.PORT" por
// todos lados, importamos PORT desde este archivo y queda más
// prolijo y fácil de testear.
// ============================================================

// dotenv es un paquetito que lee el archivo .env de la raíz
// del proyecto y carga cada linea en process.env (variables
// de entorno del proceso de Node). Hay que llamarlo UNA vez
// al iniciar la app.
import dotenv from 'dotenv';
dotenv.config();

// Exportamos el puerto. Si no existe PORT en el .env, usamos
// 3000 como default. Más adelante podemos sumar más variables
// acá (DB_URL, JWT_SECRET, etc.) para tener todo centralizado.
export const PORT = process.env.PORT || 3000;