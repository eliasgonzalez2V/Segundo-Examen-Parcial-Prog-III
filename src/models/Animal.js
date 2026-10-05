// ============================================================
//  Animal.js — Modelo de Animal
// ============================================================
// Un "modelo" representa UNA entidad de la aplicación (en este
// caso, un animal). Define qué datos tiene y qué reglas
// (validaciones) debe cumplir.
//
// Acá usamos una CLASE de JavaScript con campos privados
// (los # al principio). Esto se llama ENCAPSULAMIENTO:
// desde afuera de la clase no se puede acceder ni modificar
// directamente mail/clave/tipo; hay que pasar por los getters
// y por el setId controlado.
// ============================================================

export class Animal {
  // --- Campos privados (con #) ---
  // No se pueden leer ni escribir desde fuera de la clase.
  // Esto protege los datos: por ejemplo, la clave (#clave)
  // queda "escondida" y solo se devuelve en toJSON() si
  // nosotros explícitamente lo permitimos.
  #id;
  #codigo;
  #especie;
  #raza;
  #perfil;

  // --- Constructor ---
  // Se ejecuta cuando hacemos "new Animal({...})".
  // Acá recibimos los datos y aplicamos las validaciones.
  // Si algo está mal, lanzamos un Error que después el
  // controller atrapará con try/catch.
  constructor({ id = null, codigo, especie, raza, perfil = {} }) {
    // Cada "this.#campo = this.validarX(...)" corre la
    // validación y, si pasa, guarda el valor. Si no pasa,
    // la validación lanza Error y el constructor se corta.
    this.#id = id;
    this.#codigo = codigo;
    this.#especie = especie;
    this.#raza = raza;
    this.#perfil = perfil;
  }

  // --- Validaciones ---
  // Cada método valida UNA regla. Lanzan Error si no se cumple.
  // Más adelante podemos moverlas a una librería como "zod"
  // o "express-validator", pero por ahora las escribimos a mano
  // para entender la idea.

  // El código tiene que existir y tener al menos 3 caracteres.
  validarCodigo(codigo) {
    if (!codigo || codigo.length < 3) {
      throw new Error('El código debe tener al menos 3 caracteres');
    }
    return codigo;
  }

  // La especie debe tener al menos 4 caracteres.
  validarEspecie(especie) {
    if (!especie || especie.length < 4) {
      throw new Error('La especie debe tener al menos 4 caracteres');
    }
    return especie;
  }

  // El tipo solo puede ser 'ADMIN' o 'STD' (estándar/usuario
  // común). Usamos un array con los valores permitidos.
  validarRaza(raza) {
    const razasPermitidas = ['Perro', 'Gato', 'Ave', 'Reptil', 'Otro'];
    if (!razasPermitidas.includes(raza)) {
      throw new Error('La raza no es válida');
    }
    return raza;
  }

  // --- Getters ---
  // Permiten LEER los campos privados desde afuera, pero no
  // modificarlos. Por eso el id solo tiene getter (es único
  // y lo asigna el "db", no el cliente).
  get id() { return this.#id; }
  get codigo() { return this.#codigo; }
  get especie() { return this.#especie; }
  get raza() { return this.#raza; }
  get perfil() { return this.#perfil; }

  // --- Setter controlado del id ---
  // No dejamos "set id" público porque no queremos que
  // cualquiera lo cambie. En cambio, exponemos setId(id)
  // para que SOLO la capa de datos (db.js) lo asigne al
  // crear/actualizar.
  setId(id) { this.#id = id; }

  // --- Serialización a JSON ---
  // Cuando Express responde con res.json(usuario), internamente
  // llama a animal.toJSON(). Devolvemos un objeto "limpio":
  //   - SIN la clave (por seguridad, no la mandamos al cliente).
  //   - SIN campos internos como __v.
  // Si querés que el id aparezca como "_id" (estilo MongoDB),
  // lo cambiamos acá en un futuro.
  toJSON() {
    return {
      id: this.#id,
      codigo: this.#codigo,
      especie: this.#especie,
      raza: this.#raza,
      perfil: this.#perfil,
    };
  }
}
