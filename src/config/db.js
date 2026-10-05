// ============================================================
//  db.js — "Base de datos" en memoria, hidratada desde data/*.json
// ============================================================
// A diferencia de la versión anterior (arrays vacíos), acá
// leemos los archivos de la carpeta /data al arrancar y los
// cargamos en memoria. Así el estudiante ya ve datos cuando
// hace su primer GET.
//
// ⚠️ Sigue siendo NO persistente: si modificás algo en memoria
// y reiniciás el server, vuelve al estado del JSON.
//
// Formato de los JSON: Extended JSON de MongoDB (los que
// exporta mongoexport). Eso quiere decir que los _id vienen
// como { "$oid": "...." } y los timestamps como { "$date":
// "..." }. La función "normalize" se encarga de aplanarlos.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Usuario } from '../models/Usuario.js';
import { Animal } from '../models/Animal.js';

// --- Resolución de la ruta a /data ---
// __filename y __dirname no existen en ESM, así que los
// reconstruimos a partir de import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const USER_PATH = path.join(DATA_DIR, './sgara.usuarios.json');
const ANIMAL_PATH = path.join(DATA_DIR, './sgara.animales.json');

// ============================================================
//  normalize — aplana el formato Extended JSON de MongoDB
// ============================================================
// Recorre un objeto/array y reemplaza:
//   { "$oid": "abc..." }  ->  "abc..."
//   { "$date": "..." }    ->  new Date("...")
// De esta forma, en memoria los ids son strings y las fechas
// son objetos Date nativos de JavaScript.
const normalize = (value) => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    // Caso especial: $oid
    if (Object.keys(value).length === 1 && value.$oid) {
      return value.$oid;
    }
    // Caso especial: $date
    if (Object.keys(value).length === 1 && value.$date) {
      return new Date(value.$date);
    }
    // Objeto "normal": normalizamos campo a campo.
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalize(v);
    }
    return out;
  }
  return value;
};

// --- Lectura síncrona del JSON ---
// Usamos readFileSync porque los archivos son chicos y la
// carga se hace UNA vez al arrancar el server. Si los JSON
// crecieran mucho, conviene pasar a readFile async.
const loadJSON = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return normalize(JSON.parse(raw));
};

// ============================================================
//  Hidratación: arrays en memoria con datos del seed
// ============================================================
// La forma del JSON de usuarios coincide casi 1:1 con lo que
// espera el modelo Usuario (mail, clave, rol, perfil), solo
// que el id viene como _id (estilo Mongo) en vez de id. Por
// eso, para usuarios, instanciamos la clase Usuario y le
// pasamos el _id con setId.
const usuariosSeed = loadJSON('./sgara.usuarios.json');
const animalesSeed = loadJSON('./sgara.animales.json');

const usuarios = usuariosSeed.map((u) => {
  const usuario = new Usuario({
    mail: u.mail,
    password: u.password,
    rol: u.rol,
    perfil: u.perfil,
  });
  usuario.setId(u.id);
  return usuario;
});

//Esto fue necesario ya que tendremos que trata a cada animal de manera particular y puede
//que se deba agregar o quitar ciertas propiedades del cada animal
const animales = animalesSeed.map((a) => {
  const animal = new Animal({
    codigo: a.codigo,
    especie: a.especie,
    raza: a.raza,
    perfil: a.perfil,
  });
  animal.setId(a.id);
  return animal;
});

// --- nextId para nuevos registros ---
// Como los _id del seed son ObjectId hex (no numéricos), para
// los registros NUEVOS generamos un id "suficientemente único"
// combinando timestamp + random. Dejamos los ObjectId del seed
// intactos para no romper las referencias (autor_id, etc.).
let nextId = Date.now();
const newId = () => `${nextId++}-${Math.random().toString(36).slice(2, 8)}`;

// ============================================================
//  db — Objeto que expone las operaciones CRUD
// ============================================================
export const db = {
  usuarios,
  animales,

  // --- Utilidad interna (la usan los controllers) ---
  newId,

  // ========================================================
  //  Operaciones de USUARIOS
  // ========================================================
  getUsuarios: () => usuarios,

  getUsuarioById: (id) => usuarios.find((u) => u.id === id),

  createUsuario: (data) => {
    console.log("ESTOY ENTRANDO A CREATE USUARIO"); // <-- Poné esto acá arriba
    data.setId(newId());
    usuarios.push(data);

    try {
      const datosParaGuardar = usuarios.map(u => u.toStorage());

      fs.writeFileSync(USER_PATH, JSON.stringify(datosParaGuardar, null, 2));
      console.log("¡Usuario guardado con éxito!");
    } catch (error) {
      console.error("ERROR AL GUARDAR EL USUARIO:", error);
    }
    return data;
  },

  getUsuarioByMail: (mail) => {
    console.log("Buscando mail:", mail);
    console.log("Mails disponibles en memoria:", usuarios.map(u => u.mail));
    return usuarios.find(u => u.mail && u.mail.trim().toLowerCase() === mail.trim().toLowerCase());
  },

  updateUsuario: (id, datosNuevos) => {
    const usuario = usuarios.find(u => u.id == id);
    if (!usuario) return null;

    // Actualizamos solo los campos que vienen en el body
    if (datosNuevos.mail) usuario.mail = datosNuevos.mail; // (o usa un método setter si mail es privado)
    if (datosNuevos.rol) usuario.rol = datosNuevos.rol;
    if (datosNuevos.perfil) usuario.perfil = datosNuevos.perfil;

    // SOLO si te mandaron una contraseña nueva Y no está ya hasheada, la hasheás acá mismo
  if (datosNuevos.password && !datosNuevos.password.startsWith('$2b$')) {
    usuario.password = bcrypt.hashSync(datosNuevos.password, 10);
  }

    // Guardamos los cambios en el archivo JSON físico
    try {
      const datosParaGuardar = usuarios.map(u => u.toStorage());
      fs.writeFileSync(USER_PATH, JSON.stringify(datosParaGuardar, null, 2));
      console.log("¡Usuario actualizado y guardado en disco con éxito!");
    } catch (error) {
      console.error("ERROR AL GUARDAR EL ARCHIVO TRAS ACTUALIZAR:", error);
    }

    return usuario;
  },

  deleteUsuario: (id) => {

    const index = usuarios.findIndex((u) => u.id == id);

    if (index === -1) return false;

    usuarios.splice(index, 1);

    try {
      const datosParaGuardar = usuarios.map(u => u.toStorage());
      fs.writeFileSync(USER_PATH, JSON.stringify(datosParaGuardar, null, 2));
      console.log("¡Usuario eliminado con éxito!");
    } catch (error) {
      console.error("ERROR:", error);
    }

    return true;
  },

  // ========================================================
  //  Operaciones de ANIMALES
  // ========================================================
  getAnimales: () => animales,
  getAnimalById: (id) => animales.find((a) => a.id === id),
  createAnimal: (data) => {
    data.setId(newId());
    animales.push(data);

    try {
      fs.writeFileSync(ANIMAL_PATH, JSON.stringify(animales, null, 2));
      console.log("¡Animal guardado con éxito!");
    } catch (error) {
      console.error("ERROR AL GUARDAR EL ANIMAL:", error);
    }
    return data;
  },

  updateAnimal: (id, data) => {
    const index = animales.findIndex((a) => a.id === id);
    if (index === -1) return null;
    data.setId(id);
    animales[index] = data;

    // Guardamos los cambios en el archivo JSON físico
    try {
      const datosParaGuardar = animales.map(a => a.toJSON());
      fs.writeFileSync(ANIMAL_PATH, JSON.stringify(datosParaGuardar, null, 2));
      console.log("Animal actualizado y guardado en disco con éxito!");
    } catch (error) {
      console.error("ERROR AL GUARDAR EL ARCHIVO TRAS ACTUALIZAR:", error);
    }
    return data;
  },
  deleteAnimal: (id) => {
    const index = animales.findIndex((a) => a.id === id);
    if (index === -1) return false;
    animales.splice(index, 1);
    /*
        try {
          fs.writeFileSync(ANIMAL_PATH, JSON.stringify(animales, null, 2), 'utf-8');
          console.log("¡Animal eliminado!");
        } catch (error) {
          console.error("ERROR AL ELIMINAR EL ANIMAL:", error);
        }
    */
    return true;
  }
};