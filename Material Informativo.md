# Material Informativo

## Introducion
Este material es creado con el fin de que vallamos actualizándolo con material que consideremos útil, importante o como descubrimiento 

## Ejecucion de la app

* **1: cd "C:\Users\Alumno\Desktop\Nombre De Carpeta"**
El comando `cd "..."` te mueve dentro de esa carpeta específica en la terminal de Windows.
* **2: npm install o npm i**
Al escribir únicamente npm install en la terminal dentro de la carpeta de tu proyecto, [npm] lee el archivo package.json por sí solo.
* **3: npm run dev o npm run start**
El comando `npm run` ejecuta un script personalizado llamado "dev" o "start" que se encuentra configurado en la sección scripts de tu archivo package.json.


## Diferencias req.body y req.params

La diferencia principal es que `req.params` se usa para obtener datos dinámicos que vienen directamente en la ruta de la URL (como un ID), 
mientras que `req.body` se usa para recibir información oculta o extensa enviada en el cuerpo de la petición HTTP (como los datos de un formulario o un objeto JSON).

## Que pasa cuando inviertes dos middlewares

Cuando inviertes el orden de dos middlewares en Express.js, cambia el orden de ejecución, ya que Express procesa las funciones de manera estrictamente secuencial, cambiando por completo el orden en el que se procesa la solicitud (request) y la respuesta (response).

### ¿Qué sucede exactamente?

* **Cambio en el flujo de datos:** El primer middleware en ser declarado ejecuta su código y llama a next() para pasar el control al segundo. Si los inviertes, el que antes era segundo ahora se ejecuta primero, por lo que puede fallar.
* **Dependencias rotas:** Si el segundo middleware dependía de datos o modificaciones que hacía el primero en el objeto req (por ejemplo, autenticar un token antes de buscar datos de un usuario en la base de datos), la aplicación fallará o dará un comportamiento inesperado porque los datos aún no existirán.
* **Interceptación de rutas:** Si inviertes un middleware general (como una ruta raíz * o un analizador de JSON) antes de rutas específicas, el middleware invertido podría atrapar la petición primero y enviar una respuesta prematura (res.send o res.json), evitando que las demás rutas o middlewares se ejecuten.
