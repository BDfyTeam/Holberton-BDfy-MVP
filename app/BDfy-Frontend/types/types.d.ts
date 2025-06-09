import 'jwt-decode';

declare module 'jwt-decode' {
    export interface JwtPayload {
        userId: string;  // Asegúrate de que 'userId' sea del tipo adecuado (puede ser 'string' o 'number')
        // Puedes agregar otras propiedades que tengas en tu JWT si es necesario
    }
}