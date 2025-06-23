import { getToken, getUserIdFromToken } from "./handleToken";
import type { AuctionCard, RegisterUserPayload, LotCard, CompleteLot} from "./types";
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

    // Si la respuesta no fue exitosa (código 400 o 401 ??), lanzamos un error
    if (!response.ok) {
      throw new Error(data.error || data || "Error desconocido");
    }

    // Si todo salió bien, devolvemos el token
    return data.token;
  } catch (error) {
    throw error;
  }
}

// REGISTRAR UN USUARIO
export async function registerUser(payload: RegisterUserPayload) {
  try {
    const response = await fetch(
      "http://127.0.0.1:5015/api/1.0/users/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al registrar el usuario.");
    }

    const data = await response.json();

    return data.token;
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw error; // Re-lanzamos el error para que pueda ser manejado por quien llame a esta función
  }
}

// REGISTRAR UN SUBASTADOR
export async function registerAuctioner(payload: RegisterAuctioneerPayload) {
  try {
    const response = await fetch(
      "http://127.0.0.1:5015/api/1.0/users/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al registrar el subastador.");
    }

    const data = await response.json();

    return data.token;
  } catch (error) {
    console.error("Error al registrar el subastador:", error);
    throw error;
  }
}

// GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const token = getToken();

    const response = await fetch(`/api/1.0/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener el usuario.")
    }
    return await response.json();
  } catch (error) {
    console.error("Error al tratar de obtener el usuario:", error);
    throw error;
  }
}

// OBTENER EL ROL SEGUN EL ID DE UN USUARIO
export async function fetchRole() {
  try {
    const userId = getUserIdFromToken(); // Obtenemos el ID del usuario desde el token
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const response = await fetch(
      `http://127.0.0.1:5015/api/1.0/users/${userId}`
    );
    const data = await response.json();

    if (response.ok) {
      return data;
    }
    throw new Error("Error al obtener el rol del usuario.");
  } catch (err) {
    console.error("Error al obtener el rol del usuario:", err);
    throw new Error("Error al obtener el rol del usuario");
  }
}
// ENTRAR EN UNA SUBASTA (GET all auctions)
export async function getAllAuctions() {
  try {
    const response = await fetch("http://127.0.0.1:5015/api/1.0/auctions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener las subastas.");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error al obtener las subastas:", error);
    throw error;
  }
}

// CREAR UNA SUBASTA
export async function createAuction(payload: AuctionCard) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const userId = getUserIdFromToken(); // Obtenemos el ID del usuario desde el token
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const response = await fetch(
      `http://127.0.0.1:5015/api/1.0/auctions/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Enviamos el token de autenticación
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear la subasta.");
    }

    return "Subasta creada con éxito";
  } catch (error) {
    console.error("Error al crear la subasta:", error);
    return false;
  }
}



// GET TODAS LAS SUBASTAS DE UN USUARIO
export async function getAuctionsByAuctioneer() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const userId = getUserIdFromToken();
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const response = await fetch(
      `http://127.0.0.1:5015/api/1.0/auctions/auctioneer/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Enviamos el token de autenticación
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al obtener el almacenamiento."
      );
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Error al obtener el almacenamiento:", error);
    throw error; // Re-lanzamos el error para que pueda ser manejado por quien llame a esta función
  }
}

// TRAER UNA SUBASTA ESPESIFICA
export async function getAuctionById(id: string) {
  try {
    const response = await fetch(`http://127.0.0.1:5015/api/1.0/auctions/specific/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener la subasta.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener la subasta:", error);
    throw error;
  }
}

// ACTUALIZAR SUBASTA
export async function updateAuction(payload: AuctionCard) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const auctionId = payload.id;
    const response = await fetch(
      `http://127.0.0.1:5015/api/1.0/auctions/${auctionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar subasta");
    }

    return "Subasta editada con éxito";
  } catch (err) {
    console.error("Error al actualizar la subasta:", err);
    throw err;
  }
}

// CREAR UN LOTE
export async function createLot(payload: LotCard) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const auctionId = payload.auctionId;
    const response = await fetch(`http://127.0.0.1:5015/api/1.0/lots/${auctionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Enviamos el token de autenticación
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear el lote.");
    }

    return "Lote creado con éxito";
  } catch (error) {
    console.error("Error al crear el lote:", error);
    return false;
  }
}

// TRAER UN LOTE ESPESIFICO
export async function getLotById(lotId:string) {
  const token = getToken();
  if (!token) throw new Error("No se encontró el token de autenticación.");
  
  try {
    const response = await fetch(`http://127.0.0.1:5015/api/1.0/lots/specific/${lotId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Lote no encontrado.")
    }

    return await response.json();
  } catch (error) {
    console.error("No se pudo encontrar el lote:", error);
  }
}

// ACTUALIZAR LOTE
export async function updateLot(payload: LotCard) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const lotId = payload.id;
    const response = await fetch(`http://127.0.0.1:5015/api/1.0/lots/${lotId}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        lotNumber: payload.lotNumber,
        description: payload.description,
        details: payload.details,
        startingPrice: payload.startingPrice,
        auctionId: payload.auctionId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar lote");
    }
    return "Lote actualizado con exito";
  } catch (err) {
    console.error("Error al actualizar el lote:", err);
    throw err;
  }
}

// TRAER TODOS LOS LOTES DEL STORAGE
export async function getAllStorageLots() {
  const token = getToken();
  if (!token) {
    throw new Error("No se encontró el token de autenticación.");
  }
  const auctioneer_id = getUserIdFromToken();
  if (!auctioneer_id) {
    throw new Error("No se pudo obtener el ID del usuario desde el token.");
  }
  try {
    const response = await fetch(
      `http://127.0.0.1:5015/api/1.0/lots/${auctioneer_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al obtener el almacenamiento."
      );
    }

    const data = await response.json();
    const storageData = data.filter(
      (lot: CompleteLot) => lot.auction.status === 3
    );
    return storageData;
  } catch (error) {
    console.error("Error al obtener el almacenamiento:", error);
    throw error;
  }
}

// HACER UNA PUJA EN UN LOTE
export async function makeBid(lotId: string, bid: number) {
  const token = getToken();

  try {
    const dateNow = new Date();
    const response = await fetch(`http://127.0.0.1:5016/api/1.0/lots/bid/${lotId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: bid,
          time: dateNow,
          lotId: lotId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error desconocido al realizar la puja."
      );
    }

    return "✅ Puja realizada con éxito";
  } catch (err: any) {
    console.error("Error al enviar la puja:", err);
    return `❌ ${err.message}`;
  }
};
