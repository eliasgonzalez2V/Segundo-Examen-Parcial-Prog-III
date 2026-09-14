# Segundo-Examen-Parcial-Prog-III

# 🐾 Sistema de Gestión y Administración de Rescate Animal


---

## 📋 Descripción del Proyecto

El **Sistema de Gestión y Administración de Rescate Animal** está diseñado para optimizar las tareas administrativas y clínicas dentro de una reserva de fauna. Permite llevar un control exhaustivo del ciclo de vida de los animales (desde su ingreso hasta su egreso), centralizar los historiales médicos de los veterinarios y validar la evolución de los animales contrastándola con parámetros estándar obtenidos mediante una API externa.

---

## 🚀 Características Principales

*   **Gestión de Usuarios y Roles:** Control de acceso diferenciado para Administradores (gestión de personal) y Veterinarios (atención y registros clínicos).
*   **CRUD Completo de Animales:** Registro de ingresos, actualización de datos y control de egresos (traslados, liberaciones o defunciones con fecha y motivo).
*   **Seguimiento Clínico y Evolutivo:** Carga periódica de peso, altura y observaciones médicas.
*   **Integración con API Externa:** Consulta de valores estándar de referencia según la especie para evaluar el estado nutricional y físico del animal.
*   **Arquitectura MVC Pura:** Separación clara entre la lógica de negocio, las rutas, los controladores y las vistas nativas.

---

## 🛠️ Tecnologías y Herramientas

*   **Entorno de Desarrollo:** Visual Studio Code
*   **Asistente de IA:** Kilo Code
*   **Arquitectura:** Patrón MVC (Modelo-Vista-Controlador)
*   **Backend:** Node.js con Express
*   **Base de Datos:** MongoDB
*   **Vistas:** HTML5, CSS3 y JavaScript nativo
*   **API Externa:** [API Ninjas - Animals](https://api-ninjas.com/api/animals)

---

## 👥 Roles y Permisos del Sistema

| Rol | Permisos y Funcionalidades |
| :--- | :--- |
| **Administrador** | • CRUD de usuarios (veterinarios y otros administradores).<br>• Supervisión general de estadísticas de la reserva.<br>• Auditoría de registros. |
| **Veterinario** | • CRUD de animales rescatados.<br>• Gestión de egresos (traslado, liberación, defunción).<br>• Carga y seguimiento de fichas médicas (peso, altura). |

---

## 🗄️ Estructura de Base de Datos (MongoDB)

*   **Colección `usuarios`:**
    *   `_id`, `nombre`, `email`, `password`, `rol` (`admin` / `veterinario`)
*   **Colección `animales`:**
    *   `_id`, `codigo`, `especie`, `raza`, `edad_estimada`, `fecha_ingreso`, `estado` (`En reserva` / `Trasladado` / `Liberado` / `Fallecido`), `fecha_egreso`, `motivo_egreso`
*   **Colección `seguimientos`:**
    *   `_id`, `animal_id` (Referencia), `fecha_control`, `peso`, `altura`, `observaciones`

---

## 📌 Estado del Proyecto

🚧 *En desarrollo activo bajo la guía de Kilo Code.*

# link de la api externa 
#https://api--ninjas-com.translate.goog/api/animals?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc&_x_tr_hist=true

# Prueba de funcionalidad
#La contraseña es:
#X-Api-Key: PlANbVnktcWKMdPWkHhVoJrJqgeeTxGZVfpPb6hg
#GET
#https://api.api-ninjas.com/v1/animals?name=cheetah
