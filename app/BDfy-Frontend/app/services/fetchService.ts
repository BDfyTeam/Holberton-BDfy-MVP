import { getUserIdFromToken } from "./handleToken";
import type { AuctionCard, RegisterUserPayload, LotCard } from "./types";
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
};

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
    console.log("Cuerpo de la solicitud:", JSON.stringify(payload));

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
};

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
};

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
};

// CREAR UNA SUBASTA
export async function createAuction(payload: AuctionCard) {
  try {
    const userId = getUserIdFromToken(); // Obtenemos el ID del usuario desde el token
    const token = localStorage.getItem("token");
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const response = await fetch(`http://127.0.0.1:5015/api/1.0/auctions/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Enviamos el token de autenticación
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la subasta.');
    }

    return "Subasta creada con éxito";

  } catch (error) {
    console.error("Error al crear la subasta:", error);
    return false;
  }
};

// CREAT UN LOTE
export async function createLot(payload: LotCard) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    
    const response = await fetch(`http://127.0.0.1:5015/api/1.0/lots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Enviamos el token de autenticación
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el lote.');
    }

    return "Lote creado con éxito";

  } catch (error) {
    console.error("Error al crear el lote:", error);
    return false;
  }
}

// OBTENER EL ROL SEGUN EL ID DE UN USUARIO
export async function fetchRole() {
  try {
    const userId = getUserIdFromToken(); // Obtenemos el ID del usuario desde el token
    console.log("ID del usuario:", userId); // Para depuración
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const response = await fetch(`http://127.0.0.1:5015/api/1.0/users/${userId}`);
    const data = await response.json();

    console.log("Respuesta del backend:", data); // Para depuración

    if (response.ok) {
      return data;
    }
    throw new Error("Error al obtener el rol del usuario.");
  } catch (err) {
    console.error("Error al obtener el rol del usuario:", err);
    throw new Error("Error al obtener el rol del usuario");}
}

// GET AL STORAG
export default async function getStorage() {
  try {
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const response = await fetch(`http://127.0.0.1:5015/api/1.0/auctions/Storage/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener el almacenamiento.');
    }
    
    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Error al obtener el almacenamiento:", error);
    throw error; // Re-lanzamos el error para que pueda ser manejado por quien llame a esta función
  }
}