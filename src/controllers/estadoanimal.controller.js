// ============================================================
//  estadoanimal.controller.js — Controladores HTTP de Estados de Animales
// ============================================================
// Cada función de esta capa recibe directamente (req, res) y
// se registra como handler de Express. Acá vive la lógica de
// lectura de req.params/req.body, validaciones, acceso a
// la base de datos y construcción de la respuesta HTTP.
//
// Las rutas de estadoanimales.routes.js solo deben invocar estas
// funciones;
// ============================================================

import { EstadoAnimal } from "../models/EstadoAnimal.js";
import { Animal } from "../models/Animal.js";

// ============================================================
//  obtenerEstadoAnimales — GET /api/estados
// ============================================================
// Devuelve todos los registros de estado con la info del animal poblada.
export const obtenerEstadoAnimales = async (req, res, next) => {
  try {
    const estados = await EstadoAnimal.find().populate('animalInfo');
    res.json(estados);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  obtenerEstadoAnimalPorId — GET /api/estados/:id
// ============================================================
// El id llega como string en req.params.id. Si no existe, responde 404.
export const obtenerEstadoAnimalPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const estado = await EstadoAnimal.findById(id).populate('animalInfo');
    if (!estado) {
      return res.status(404).json({ mensaje: "Estado de animal no encontrado" });
    }

    res.json(estado);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  obtenerEstadoAnimalPorCodigo — GET /api/estados/codigo/:codigo
// ============================================================
// Busca un estado utilizando el código del animal.
export const obtenerEstadoAnimalPorCodigo = async (req, res, next) => {
  try {
    const { codigo } = req.params;

    // Nota Mental: find({ codigo }) si hay varios registros por código 
    // listara todos los movimientos de un animal, 
    // o se puede usar findOne({ codigo }) y te traerá el primero.
    const estado = await EstadoAnimal.find({ codigo }).populate('animalInfo');
    if (!estado) {
      return res.status(404).json({ mensaje: "No se encontró un estado para el código proporcionado" });
    }

    res.json(estado);
  } catch (error) {
    next(error);
  }
};


// ============================================================
//  crearEstadoAnimal — POST /api/estados
// ============================================================
// Valida que el animal exista antes de registrarle un estado.
export const crearEstadoAnimal = async (req, res, next) => {
  try {
    const { codigo, fecha_ingreso, estado, fecha_egreso, descripcion } = req.body;

    // Verificamos opcionalmente que el animal exista en la colección 'Animales'
    const animalExiste = await Animal.findOne({ codigo });
    if (!animalExiste) {
      return res.status(404).json({ mensaje: `No existe un animal registrado con el código: ${codigo}` });
    }

    // Si el estado es 'En reserva', forzamos que no tenga fecha de egreso (Reingreso)
    const fechaEgresoFinal = estado === 'En reserva' ? null : fecha_egreso;

    // Validación de coherencia temporal (El egreso no puede ser anterior al ingreso)
    if (fecha_ingreso && fecha_egreso) {
      const ingreso = new Date(fecha_ingreso);
      const egreso = new Date(fecha_egreso);

      if (egreso < ingreso) {
        return res.status(400).json({
          mensaje: "La fecha de egreso no puede ser anterior a la fecha de ingreso."
        });
      }
    }

    // Validación de consistencia para estados terminales
    const estadosTerminales = ['Fallecido', 'Adoptado', 'Liberado'];
    if (estadosTerminales.includes(estado) && !fecha_egreso) {
      return res.status(400).json({
        mensaje: `El estado '${estado}' requiere obligatoriamente una fecha de egreso registrada.`
      });
    }

    const nuevoEstadoAnimal = new EstadoAnimal({
      codigo,
      fecha_ingreso,
      estado,
      fecha_egreso,
      descripcion,
    });

    const creado = await nuevoEstadoAnimal.save();

    // Poblamos la info del animal (cruzar información entre colecciones)
    // antes de responder para que el cliente lo reciba completo
    await creado.populate('animalInfo');

    console.log("¡Estado de animal guardado con éxito en MongoDB!", creado.codigo);

    res.status(201).json(creado);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  actualizarEstadoAnimal — PUT /api/estados/:id
// ============================================================
// Actualiza de forma parcial o total un registro de estado.
export const actualizarEstadoAnimal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { codigo, fecha_ingreso, estado, fecha_egreso, descripcion } = req.body;

    const existente = await EstadoAnimal.findById(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Estado de animal no encontrado" });
    }

    // Si envían un nuevo código, validamos que exista en el modelo Animal
    if (codigo !== undefined && codigo !== existente.codigo) {
      const animalExiste = await Animal.findOne({ codigo });
      if (!animalExiste) {
        return res.status(404).json({ mensaje: `No existe un animal registrado con el código: ${codigo}` });
      }
    }

    // Determinamos los valores finales (combinando lo nuevo con lo existente para validar)
    const ingresoValidar = fecha_ingreso !== undefined ? fecha_ingreso : existente.fecha_ingreso;
    const egresoValidar = fecha_egreso !== undefined ? fecha_egreso : existente.fecha_egreso;
    const estadoValidar = estado !== undefined ? estado : existente.estado;

    // 1. Validación de coherencia temporal
    if (ingresoValidar && egresoValidar) {
      if (new Date(egresoValidar) < new Date(ingresoValidar)) {
        return res.status(400).json({ 
          mensaje: "La fecha de egreso no puede ser anterior a la fecha de ingreso." 
        });
      }
    }

    // 2. Validación de consistencia para estados terminales
    const estadosTerminales = ['Fallecido', 'Adoptado', 'Liberado'];
    if (estadosTerminales.includes(estadoValidar) && !egresoValidar) {
      return res.status(400).json({ 
        mensaje: `El estado '${estadoValidar}' requiere obligatoriamente una fecha de egreso registrada.` 
      });
    }

    // Construcción dinámica limpia usando el spread operator
    const datosActualizados = {
      ...(codigo !== undefined && { codigo }),
      ...(fecha_ingreso !== undefined && { fecha_ingreso }),
      ...(estado !== undefined && { estado }),
      ...(fecha_egreso !== undefined && { fecha_egreso }),
      ...(descripcion !== undefined && { descripcion })
    };

    const actualizado = await EstadoAnimal.findByIdAndUpdate(
      id,
      { $set: datosActualizados },
      { returnDocument: 'after', runValidators: true }
    ).populate('animalInfo');

    res.json(actualizado);
  } catch (error) {
    next(error);
  }
};

// ============================================================
//  eliminarEstadoAnimal — DELETE /api/estados/:id
// ============================================================
// Responde 204 cuando elimina y 404 cuando el id no existe.
export const eliminarEstadoAnimal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eliminado = await EstadoAnimal.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: "Estado de animal no encontrado" });
    }

    res.status(204).send();
    console.log("Estado de animal eliminado");
  } catch (error) {
    next(error);
  }
};