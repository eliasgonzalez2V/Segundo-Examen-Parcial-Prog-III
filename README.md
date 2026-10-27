# Segundo-Examen-Parcial-Prog-III

# 🐾 Sistema de Gestión y Administración de Rescate Animal

---

## 📋 Descripción del Proyecto

El **Sistema de Gestión y Administración de Rescate Animal** está diseñado para optimizar las tareas administrativas y clínicas dentro de una reserva de fauna. Permite llevar un control exhaustivo del ciclo de vida de los animales (desde su ingreso hasta su egreso), centralizar los historiales médicos registrados por los **Veterinarios** (**Usuario Final** principal del sistema) y consultar parámetros estándar de referencia mediante una API externa.

---

## 🚀 Características Principales

* **Gestión de Usuarios y Roles:** Control de acceso diferenciado entre Administradores (gestión de personal y auditoría) y Veterinarios (Usuario Final que realiza la atención y los registros clínicos).
* **CRUD Completo de Animales:** Registro de datos fijos del animal (código, especie, clase, origen, fecha de nacimiento), actualización de datos y control de egresos.
* **Ciclo de Vida y Estados:** Registro histórico de movimientos mediante la colección de estados (`En reserva`, `Trasladado`, `Liberado`, `Fallecido`) vinculados al código del animal.
* **Seguimiento Clínico y Evolutivo:** Carga periódica de peso, altura y observaciones médicas por parte del veterinario.
* **Estadísticas Grupales:** Seguimiento de ingresos y egresos por fecha, total de animales en la reserva y desglose por especie y clase.
* **Integración Complementaria con API Externa:** Consulta y comparación de datos biológicos estándar de referencia según la especie. Funciona como una herramienta de consulta informativa que no representa una dependencia crítica para la operatividad del sistema ni abarca diagnósticos clínicos.

---

## 🛠️ Tecnologías y Arquitectura

El proyecto adopta una arquitectura desacoplada con repositorios independientes para Frontend y Backend:

* **Backend (API REST):** Desarrollado con Node.js, Express y Mongoose. Express no renderiza vistas en el servidor, sino que expone exclusivamente endpoints RESTful que devuelven datos en formato JSON.
* **Frontend (SPA):** Single Page Application independiente construida con HTML5, CSS3 y JavaScript nativo, la cual consume la API REST del backend.
* **Base de Datos:** MongoDB.
* **Entorno de Desarrollo:** Visual Studio Code.
* **API Externa:** [API Ninjas - Animals](https://api-ninjas.com/api/animals) (utilizada como servicio complementario de consulta y referencia).

---

## 👥 Roles y Permisos del Sistema

| Rol | Clasificación | Permisos y Funcionalidades |
| :--- | :--- | :--- |
| **`ADMIN`** | Gestión de Sistema | • CRUD de usuarios (veterinarios y administradores).<br>• Supervisión general de estadísticas de la reserva.<br>• Auditoría de registros. |
| **`VETER`** | **Usuario Final** | • CRUD de animales rescatados.<br>• Gestión del estado del animal (ingresos, traslados, liberaciones, defunciones).<br>• Carga y seguimiento de fichas médicas (peso, altura, observaciones). |

---

## 🗄️ Estructura de Base de Datos (MongoDB)

Las colecciones y modelos Mongoose implementados responden directamente a los casos de uso del sistema:

* **Colección `users` (Modelo `Usuario`):**
  * `mail` *(único)*, `password` *(select: false)*, `rol` (`ADMIN` / `VETER`), `perfil` `{ nombre, apellido, foto }`, `createdAt`, `updatedAt`
* **Colección `animales` (Modelo `Animal`):**
  * `codigo` *(clave única de negocio)*, `especie`, `clase`, `raza`, `origen`, `fechaNacimiento`, `perfil` `{}`
* **Colección `estados` (Modelo `EstadoAnimal`):**
  * `codigo` *(referencia al animal)*, `fecha_ingreso`, `estado` (`En reserva` / `Trasladado` / `Liberado` / `Fallecido`), `fecha_egreso`, `descripcion`, `animalInfo` *(virtual populates)*
* **Colección `seguimientos` (Modelo `Seguimiento`):**
  * `codigo` *(referencia al animal)*, `fecha_control`, `peso`, `altura`, `observaciones`, `animalInfo` *(virtual populates)*

---

## 🔌 Endpoints de la API REST

El backend expone una API REST organizada mediante los siguientes prefijos de rutas:

* **`POST /api/login`** — Autenticación de usuarios y emisión de token JWT.
* **`/api/usuarios`** — Gestión de usuarios, perfiles y control de roles (`ADMIN` / `VETER`).
* **`/api/animales`** — ABM (CRUD) de los datos fijos de los animales registrados en la reserva.
* **`/api/estados`** — Gestión del ciclo de vida y movimientos de los animales (`En reserva`, `Trasladado`, `Liberado`, `Fallecido`).
* **`/api/seguimientos`** — Registro de controles médicos y evolutivos periódicos (peso, altura, observaciones).

---

## 📌 Estado del Proyecto

🚧 *En desarrollo activo.*