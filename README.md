# Segundo-Examen-Parcial-Prog-III

# 🐾 Sistema de Gestión y Administración de Rescate Animal

---

## 📋 Descripción del Proyecto

El **Sistema de Gestión y Administración de Rescate Animal** está diseñado para optimizar las tareas administrativas y clínicas dentro de una reserva de fauna. Permite llevar un control exhaustivo del ciclo de vida de los animales (desde su ingreso hasta su egreso), centralizar los historiales médicos registrados por los **Veterinarios** (**Usuario Final** principal del sistema) y consultar parámetros estándar de referencia mediante una API externa.

---

| Integrante | Módulos y Responsabilidades a Cargo |
| :--- | :--- |
| **Daniel Cardozo** | • Modelos, Controladores y Rutas de **Usuarios** y **Animales**.<br>• Implementación de Middlewares de autenticación y seguridad. |
| **Elías González** | • Modelos, Controladores y Rutas de **Seguimientos** y **EstadosAnimal**.<br>• Integración y aislamiento de servicios de API externa. |

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
* **Base de Datos:** MongoDB.
* **Entorno de Desarrollo:** Visual Studio Code.
* **API Externa:** [API Ninjas - Animals](https://api-ninjas.com/api/animals) (utilizada como servicio complementario de consulta y referencia).

---

## 📂 Estructura de Directorios del Proyecto

**Segundo-Examen-Parcial-Prog-III/**<br>
├── src/<br>
│   ├── controllers/<br>
│   ├── data/<br>
│   ├── middlewares/<br>
│   ├── models/<br>
│   ├── routes/<br>
│   └── app.js<br>
├── .env.example<br>
├── package.json<br>
└── README.md

---

## ⚙️ Instalación y Configuración Local

Para levantar el proyecto en un entorno local, seguí estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/eliasgonzalez2V/Segundo-Examen-Parcial-Prog-III.git
   cd Segundo-Examen-Parcial-Prog-III
   
2. **Entrar a la carpeta del proyecto:**

   bash
   cd Segundo-Examen-Parcial-Prog-III

3. **Instalar dependencias:**
   bash
   npm install

4. **Configurar las variables de entorno:**
Creá un archivo .env en la raíz del proyecto basándote en el archivo .env.example:

PORT=3000
MONGO_URI=tu_conexion_a_mongodb
JWT_SECRET=tu_clave_secreta_jwt
API_NINJAS_KEY=tu_clave_de_api_ninjas

5. **Ejecuta el servidor en desarrollo:**
   bash
   npm run dev

---

## 👥 Roles y Permisos del Sistema

| Rol | Clasificación | Permisos y Funcionalidades |
| :--- | :--- | :--- |
| **`ADMIN`** | Gestión de Sistema | • CRUD de usuarios (veterinarios y administradores).<br>• Supervisión general de estadísticas de la reserva.<br>• Auditoría de registros. |
| **`VETER`** | **Usuario Final** | • CRUD de animales rescatados.<br>• Gestión del estado del animal (ingresos, traslados, liberaciones, defunciones).<br>• Carga y seguimiento de fichas médicas (peso, altura, observaciones). |

---

## 🗄️ Estructura de Base de Datos (MongoDB)

Las colecciones y modelos Mongoose implementados responden directamente a los casos de uso del sistema:

* **Colección `usuarios` (Modelo `Usuario`):**
  * `mail` *(único)*, `password` *(select: false)*, `rol` (`ADMIN` / `VETER`), `perfil` `{ nombre, apellido, foto }`, `createdAt`, `updatedAt`
* **Colección `animales` (Modelo `Animal`):**
  * `codigo` *(clave única de negocio)*, `especie`, `clase`, `raza`, `origen`, `fechaNacimiento`, `perfil` `{}`
* **Colección `estados` (Modelo `EstadoAnimal`):**
  * `codigo` *(referencia al animal)*, `fecha_ingreso`, `estado` (`En reserva` / `Trasladado` / `Liberado` / `Fallecido`), `fecha_egreso`, `descripcion`, `animalInfo` *(virtual populates)*
* **Colección `seguimientos` (Modelo `Seguimiento`):**
  * `codigo` *(referencia al animal)*, `fecha_control`, `peso`, `altura`, `observaciones`, `animalInfo` *(virtual populates)*

---

## 🔒 Políticas de Seguridad y Reglas de Negocio
* **Creación de Administradores (ADMIN):** El registro público a través de Postman o la API fuerza por defecto el rol **VETER**, ignorando cualquier intento de enviar el rol **ADMIN** en el body. Los administradores se gestionan exclusivamente desde la base de datos.

* **Restricción de Borrado:** No se puede eliminar un animal si tiene seguimientos clínicos cargados.

---

## 🔌 Endpoints de la API REST

### 1. Autenticación
* **`POST /api/login`**
  * **Descripción:** Autentica a un usuario y emite un token JWT.
  * **Body (JSON):** `{"mail": "admin@reserva.com", "password": "tuPassword"}`
  * **Respuesta Exitosa (200 OK):** `{"token": "eyJhbGciOi...", "usuario": {...}}`

### 2. Animales
* **`GET /api/animales`** — Lista todos los animales registrados (incluye `infoExterna` enriquecida de API Ninjas).
* **`POST /api/animales`** — Registra un nuevo animal.
  * **Body (JSON):** `{"codigo": "55570", "especie": "felino", "clase": "gato", "raza": "Siamese", "origen": "doméstico"}`

### 3. Estados (Ciclo de Vida)
* **`POST /api/estados`** — Registra un cambio o estado del animal (`En reserva`, `Trasladado`, `Liberado`, `Fallecido`).

### 4. Seguimientos Clínicos
* **`GET /api/seguimientos`** — Registro de controles médicos y evolutivos periódicos (peso, altura, observaciones), con la respuesta aislada de la API externa.

---

## 📌 Estado del Proyecto

El proyecto se encuentra desplegado y operativo en: https://segundo-examen-parcial-prog-iii.onrender.com
🚧 *En desarrollo activo.*
