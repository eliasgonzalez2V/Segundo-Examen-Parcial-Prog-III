// src/services/apiNinjas.service.js

export const obtenerInfoExternaAnimal = async (especie = "", raza = "") => {
  if (!raza) return null;

  let animalSeleccionado = null;
  const especieLower = especie.toLowerCase();

  try {
    let url = `https://api.api-ninjas.com/v1/animals?name=${encodeURIComponent(raza)}`;

    if (especieLower.includes("perro") || especieLower.includes("canino")) {
      url = `https://api.api-ninjas.com/v1/dogs?name=${encodeURIComponent(raza)}`;
    } else if (especieLower.includes("gato") || especieLower.includes("felino")) {
      url = `https://api.api-ninjas.com/v1/cats?name=${encodeURIComponent(raza)}`;
    }

    const apiResponse = await fetch(url, {
      headers: {
        "X-Api-Key": process.env.API_NINJAS_KEY
      }
    });

    if (apiResponse.ok) {
      const resultados = await apiResponse.json();
      console.log("Conexión con API_NINJAS exitosa");

      if (resultados && resultados.length > 0) {
        let match = resultados.find(
          (item) => item.name.toLowerCase() === raza.toLowerCase()
        );

        if (!match) {
          match = resultados.reduce((prev, current) =>
            current.name.length < prev.name.length ? current : prev
          );
        }

        animalSeleccionado = match;
      }
    } else {
      console.error("Error al consultar la API Ninjas de animales");
      animalSeleccionado = { aviso: "Información externa no disponible temporalmente" };
    }
  } catch (fetchError) {
    console.error("Error de red o timeout al consultar la API Ninjas:", fetchError);
    animalSeleccionado = { aviso: "Error de conexión con el servicio externo" };
  }

  return animalSeleccionado;
};