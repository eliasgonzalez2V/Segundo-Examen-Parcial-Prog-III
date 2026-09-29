# Material Informativo

## Introducion
Este material es creado con el fin de que vallamos actualisandolo con material que consideremos util, importante o como descubrimiento 

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