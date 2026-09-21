export const logInfoCli = (req, resp, next) => {

    console.log(`IP del cliente: ${req.ip}`);
    console.log(`Fecha/Hora del servidor: ${new Date().toLocaleString()}`);
    next();
}