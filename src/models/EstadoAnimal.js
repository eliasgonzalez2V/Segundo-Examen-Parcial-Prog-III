/*EstadoAnimal (sgara.estados.json)
Ideal para manejar el ciclo de vida o estado actual del animal mediante una relación por codigo:

Campos: id, codigo, fecha_ingreso, estado (En reserva / Trasladado / Liberado / Fallecido), 
fecha_egreso, descripcion.

Ventaja: Si un animal cambia de estado, puedes registrar un nuevo movimiento o actualizar su estado 
actual sin alterar los datos fijos del animal.
*/
// ============================================================
//  EstadoAnimal.js — Modelo de Mongoose (BD MongoDB)
// ============================================================
// Representa la colección "estados" en MongoDB (sgara.estados.json).
// Permite gestionar el ciclo de vida y los movimientos de un animal
// mediante la relación con el campo 'codigo' del modelo Animal.
// ============================================================
import mongoose from 'mongoose';

const estadoAnimalSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El animal es requerido'],
      trim: true,
      minlength: [3, 'El código debe tener al menos 3 caracteres'],
    },
    fecha_ingreso: {
      type: Date,
      required: [true, 'La fecha de ingreso es requerida'],
      default: Date.now,
    },
    estado: {
      type: String,
      required: [true, 'El estado es requerido'],
      enum: {
        values: ['En reserva', 'Trasladado', 'Liberado', 'Fallecido'],
        message: '{VALUE} no es un estado válido',
      },
      trim: true,
    },
    fecha_egreso: {
      type: Date,
      default: null,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

// Definimos la relación virtual basada en el campo "codigo"
estadoAnimalSchema.virtual('animalInfo', {
  ref: 'Animal',
  localField: 'codigo',
  foreignField: 'codigo',
  justOne: true, // Devuelve un objeto en lugar de un array
});

// Ocultar propiedades internas (como __v) al convertir a JSON
// Incluimos virtuals: true aquí para que aparezcan en los JSON
estadoAnimalSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;        // Oculta el _id de MongoDB
    delete ret.__v;       // Remueve el número de versión
    delete ret.createdAt; // Oculta la fecha de creación de auditoría
    delete ret.updatedAt; // Oculta la fecha de actualización de auditoría
    return ret;
  },
});

export const EstadoAnimal = mongoose.model(
  'EstadoAnimal',
  estadoAnimalSchema,
  'estados'
);