import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Le indicamos a Express dónde están las vistas HTML
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Rescate Animal funcionando' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});