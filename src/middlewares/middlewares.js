import jwt from 'jsonwebtoken';

export const logInfoCli = (req, resp, next) => {

    console.log(`IP del cliente: ${req.ip}`);
    console.log(`Fecha/Hora del servidor: ${new Date().toLocaleString()}`);
    next(); // Importante !!
}

export const authToken = (req, res, next) => {
    // 1. Obtener el encabezado 'Authorization' (se espera: "Bearer <token>")
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no viene token, retornar 401
    if (!token) {
        return res.status(401).json({ mensaje: "no autorizado" });
    }

    // 3. Verificar si el token es válido
    // Reemplaza 'TU_CLAVE_SECRETA' por tu variable de entorno (ej: process.env.JWT_SECRET)
    const SECRET_KEY = process.env.JWT_SECRET || 'claveblablabla';

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ mensaje: "no autorizado" });
        }

        // 4. Token válido: adjuntamos los datos decodificados de la sesión al objeto req
        req.user = user;
        next();
    });
};

export const esAdmin = (req, res, next) => {
    // 1. Verificar si el objeto req.user existe y si el rol del usuario es "admin"
    if (!req.user || req.user.rol !== 'ADMIN') {
        return res.status(403).json({ mensaje: "no sos admin" });
    }

    next();
};