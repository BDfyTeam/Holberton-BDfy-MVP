import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem("authToken");
    console.log("Token usando 'authToken':", token);

    if (!token) {
        console.error("No se encontró el token de autenticación.");
        return null;
    }
    try {
        const decodedToken = jwtDecode<{ userId: string }>(token);
        return decodedToken.userId;
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};