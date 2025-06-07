import type { RegisterUserPayload } from "./types";
import type { RegisterAuctioneerPayload } from "./types";

// LOGUEAR UN USUARIO
export async function loginUser(email: string, password: string) {
  try {
    // Llamamos al back con los datos del formulario
    const response = await fetch("http://127.0.0.1:5015/api/1.0/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Le decimos que enviamos JSON
      },
      body: JSON.stringify({ email, password }), // Armamos el cuerpo del mensaje
    });

    // Convertimos la respuesta en JSON para poder leerla
    const data = await response.json();
    console.log("Respuesta del backend:", data);

    // Si la respuesta no fue exitosa (código 400 o 401 ??), lanzamos un error
    if (!response.ok) {
      throw new Error(data.error || data || "Error desconocido");
    }
    console.log("Codigo HTTP:", response.status);

    // Si todo salió bien, devolvemos el token
    return data.token;
  } catch (error) {
    throw error;
  }
}

// REGISTRAR UN USUARIO
export async function registerUser(payload: RegisterUserPayload) {
  try {
    const response = await fetch("http://127.0.0.1:5015/api/1.0/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar el usuario.');
    };

    const data = await response.json();
    console.log("Respuesta del backend:", data);

    return data.token;

  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw error; // Re-lanzamos el error para que pueda ser manejado por quien llame a esta función
  }
}

// REGISTRAR UN SUBASTADORREGISTRAR SUBASTADOR
export async function registerAuctioner(payload: RegisterAuctioneerPayload) {
  try {
    const response = await fetch("http://127.0.0.1:5015/api/1.0/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar el subastador.');
    };

    const data = await response.json();
    console.log("Respuesta del backend:", data);

    return data.token;

  } catch (error) {
    console.error("Error al registrar el subastador:", error);
    throw error;
  }
}

// ENTRAR EN UNA SUBASTA (GET all auctions)
export async function getAllAuctions() {
  try {
    const response = await fetch("http://127.0.0.1:5015/api/1.0/auctions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener las subastas.');
    }

    const data = await response.json();
    console.log("Respuesta del backend:", data);

    return data;

  } catch (error) {
    console.error("Error al obtener las subastas:", error);
    throw error;
  } 
}