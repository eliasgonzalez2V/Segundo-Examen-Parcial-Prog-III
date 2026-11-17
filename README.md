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

6. **Auditoría y Seguridad de Dependencias:**
   Se ejecutó `npm audit fix` para resolver vulnerabilidades transitivas detectadas en producción, manteniendo el archivo `package-lock.json` actualizado y seguro.
---

### 📋 Control de Accesos y Permisos por Operación 

| Recurso / Módulo | Operación (Método / Ruta) | Rol `ADMIN` | Rol `VETER` | Tipo de Gestión / Restricción |
| :--- | :--- | :--- | :--- | :--- |
| **Usuarios / Personal** | `POST /api/usuarios` (Alta) | **Permitido** | Denegado | **Estrictamente Administrativa** (solo el ADMIN crea cuentas de personal). |
| **Usuarios / Personal** | `DELETE /api/usuarios/:id` | **Permitido** | Denegado | Borrado físico/administrativo exclusivo del ADMIN. |
| **Animales** | `POST /api/animales` (Crear) | **Permitido** | **Permitido** | Alta operativa compartida. |
| **Animales** | `PUT /api/animales/:id` (Actualizar) | **Permitido** | **Permitido** | Edición de datos clínicos y generales. |
| **Animales** | `DELETE /api/animales/:id` | **Permitido** | Denegado | Borrado físico exclusivo de ADMIN. |
| **Estados del Animal** | Gestión de ingresos y bajas operativas | **Permitido** | **Permitido** | Las bajas de animales (defunciones, adopciones) se realizan vía **cambio de estado**, no por borrado. |
| **Seguimientos** | `POST / PUT /api/seguimientos` | **Permitido** | **Permitido** | Registro y actualización del historial clínico. |
| **Seguimientos** | `DELETE /api/seguimientos/:id` | **Permitido** | Denegado | Borrado físico exclusivo de ADMIN (preservación de auditoría clínica). |

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

- **Manejo Centralizado de Errores:** Implementación de un middleware global de captura de excepciones con la firma de cuatro parámetros `(err, req, res, next)`, ubicado al final de la pila de rutas en `app.js` para estandarizar las respuestas HTTP y evitar redundancias de bloques `try/catch`.
---

## 🔌 Endpoints de la API REST

### 1. Autenticación
- **`POST /api/login`**
  * **Descripción:** Autentica a un usuario y emite un token JWT.
  * **Body (JSON):** `{"mail": "admin@reserva.com", "password": "tuPassword"}`
  * **Respuesta Exitosa (200 OK):** `{"token": "eyJhbGciOi...", "usuario": {...}}`

### 2. Animales
- **`GET /api/animales`** — Lista todos los animales registrados.
- **`GET /api/animales/codigo/:codigo`** — Obtiene la ficha de un animal por su código (incluye `infoExterna` enriquecida de API Ninjas).
- **`POST /api/animales`** — Registra un nuevo animal.
  * **Body (JSON):** `{"codigo": "55570", "especie": "felino", "clase": "gato", "raza": "Siamese", "origen": "doméstico"}`

### 3. Estados (Ciclo de Vida)
- **`GET /api/estados`** — Lista el historial de estados y movimientos registrados.
- **`POST /api/estados`** — Registra un cambio o estado del animal (`En reserva`, `Trasladado`, `Liberado`, `Fallecido`).

### 4. Seguimientos Clínicos
- **`GET /api/seguimientos`** — Lista todos los controles médicos registrados.
- **`GET /api/seguimientos/codigo/:codigo`** — Historial de controles médicos y evolutivos periódicos (peso, altura, observaciones) de un animal, con la respuesta aislada de la API externa.

---

## 📌 Estado del Proyecto

El proyecto se encuentra desplegado y operativo en: https://segundo-examen-parcial-prog-iii.onrender.com
🚧 *En desarrollo activo.*
