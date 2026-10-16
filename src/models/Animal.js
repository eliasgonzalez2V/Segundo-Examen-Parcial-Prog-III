// ============================================================
//  Animal.js — Modelo de Mongoose (BD MongoDB)
// ============================================================
// Representa la colección "animales" en MongoDB.
// Define la estructura, reglas y validaciones de los animales.
// ============================================================
import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El código debe tener al menos 3 caracteres'],
    },
    especie: {
      type: String,
      required: [true, 'La especie es requerida'],
      trim: true,
      minlength: [3, 'La especie debe tener al menos 3 caracteres'],
    },
    clase: {
      type: String,
      required: [true, 'La clase es requerida'],
      trim: true,
    },
    subtipo: {
      type: String,
      trim: true,
    },
    origen: {
      type: String,
      trim: true,
    },
    perfil: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Ocultar propiedades internas (como __v) al convertir a JSON
animalSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;       // Remueve el ID largo de MongoDB si usamos su codigo
    delete ret.__v;       // Remueve el número de versión
    delete ret.createdAt; // Oculta la fecha de creación
    delete ret.updatedAt; // Oculta la fecha de actualización
    return ret;
  },
});

export const Animal = mongoose.model('Animal', animalSchema, 'animales');