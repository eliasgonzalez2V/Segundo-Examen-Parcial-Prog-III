/*Seguimiento (sgara.seguimientos.json)
Perfecto para los controles médicos o físicos periódicos (relación 1 a muchos con el animal):

Campos: id, codigo, fecha_control, peso, altura, observaciones.

Ventaja: Un animal podrá tener múltiples seguimientos a lo largo del tiempo sin saturar su objeto principal.
*/
// ============================================================
//  Seguimiento.js — Modelo de Mongoose (BD MongoDB)
// ============================================================
// Representa la colección "seguimientos" en MongoDB (sgara.seguimientos.json).
// Permite registrar controles periódicos (peso, altura, observaciones) 
// de un animal mediante la relación 1 a muchos con el campo 'codigo'.
// ============================================================
import mongoose from 'mongoose';

const seguimientoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código del animal es requerido'],
      trim: true,
      minlength: [3, 'El código debe tener al menos 3 caracteres'],
    },
    fecha_control: {
      type: Date,
      required: [true, 'La fecha de control es requerida'],
      default: Date.now,// Guarda automáticamente la fecha y hora actual si no se especifica
    },
    peso: {
      type: Number,
      required: [true, 'El peso es requerido'],
      min: [0, 'El peso no puede ser negativo'],
    },
    altura: {
      type: Number,
      required: [true, 'La altura es requerida'],
      min: [0, 'La altura no puede ser negativa'],
    },
    observaciones: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

// Definimos la relación virtual basada en el campo "codigo" para poblar la info del animal
seguimientoSchema.virtual('animalInfo', {
  ref: 'Animal',
  localField: 'codigo',
  foreignField: 'codigo',
  justOne: true, // Devuelve un objeto en lugar de un array
});

// Ocultar propiedades internas al convertir a JSON
seguimientoSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    
    delete ret.__v;       // Remueve el número de versión
    delete ret.createdAt; // Oculta la fecha de creación de auditoría
    delete ret.updatedAt; // Oculta la fecha de actualización de auditoría
    if (ret.animalInfo) {
      delete ret.animalInfo.codigo;
      delete ret.animalInfo.perfil;
    }
    return ret;
  },
});

export const Seguimiento = mongoose.model(
  'Seguimiento',
  seguimientoSchema,
  'seguimientos'
);