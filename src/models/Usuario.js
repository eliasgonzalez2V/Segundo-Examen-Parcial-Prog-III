// ============================================================
// 8: Usuario.js — Modelo de Mongoose (BD MongoDB)
// ============================================================
// Representa la colección "users" en MongoDB.
// Campos del documento de muestra:
//   _id, mail, clave, tipo, perfil { nombre, foto },
//   createdAt, updatedAt
// ============================================================
import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {mail: {
      type: String,
      required: [true, 'El mail es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Mail inválido'],
    },
    password: {
      type: String,
      required: [true, 'La clave es requerida'],
      minlength: [8, 'La clave debe tener al menos 8 caracteres'],
      select: false,
    },
    rol: {
      type: String,
      enum: { values: ['ADMIN', 'VETER'], message: 'Rol inválido' },
      default: 'VETER',
    },
    perfil: {
      nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [60, 'El nombre no puede superar 60 caracteres'],
      },
      apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
        maxlength: [60, 'El apellido no puede superar 60 caracteres'],
      },
      foto: {
        type: String,
        trim: true,
        default: '',
      },
    },
  },
  { timestamps: true }
);

// No devolver la clave ni __v en las respuestas JSON
usuarioSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;  
    delete ret._id;       // Remueve el ID largo de MongoDB si usamos su mail
    delete ret.__v;       // Remueve el número de versión
    delete ret.createdAt; // Oculta la fecha de creación
    delete ret.updatedAt; // Oculta la fecha de actualización
    return ret;
  },
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);