import Title from "~/components/FormFields/AucLotCreationFields/Title";
import { getToken, getUserIdFromToken } from "./handleToken";
import type {
  RegisterUser,
  RegisterAuctioneer,
  FormLot,
  CompleteLot,
  AuctionForm
} from "./types";

// LOGUEAR UN USUARIO
export async function loginUser(email: string, password: string) {
  try {
    // Llamamos al back con los datos del formulario
    const response = await fetch("http://localhost:5015/api/1.0/users/login", {
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
export async function registerUser(payload: RegisterUser) {
  try {
    const response = await fetch(
      "http://localhost:5015/api/1.0/users/register",
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
export async function registerAuctioner(payload: RegisterAuctioneer) {
  try {
    const response = await fetch(
      "http://localhost:5015/api/1.0/users/register",
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

    const response = await fetch(`http://localhost:5015/api/1.0/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al obtener el usuario.");
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
      `http://localhost:5015/api/1.0/users/${userId}`
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
    const response = await fetch("http://localhost:5015/api/1.0/auctions", {
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
export async function createAuction(payload: AuctionForm) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const userId = getUserIdFromToken(); // Obtenemos el ID del usuario desde el token
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario desde el token.");
    }

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("image", payload.image);
    formData.append("description", payload.description);
    formData.append("startAt", payload.startAt);
    if (payload.endAt) {
      formData.append("endAt", payload.endAt);
    }
    payload.category.forEach((cat) =>
      formData.append("Category", cat.toString())
    );
    formData.append("status", payload.status.toString());
    formData.append("Direction.Street", payload.direction.street);
    formData.append(
      "Direction.StreetNumber",
      payload.direction.streetNumber.toString()
    );
    formData.append("Direction.Corner", payload.direction.corner);
    formData.append("Direction.Department", payload.direction.department);
    formData.append("Direction.ZipCode", payload.direction.zipCode.toString());

    const response = await fetch(
      `http://localhost:5015/api/1.0/auctions/${userId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
      `http://localhost:5015/api/1.0/auctions/auctioneer/${userId}`,
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
    const response = await fetch(
      `http://localhost:5015/api/1.0/auctions/specific/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
export async function updateAuction(payload: AuctionForm) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const auctionId = payload.id;

    const formData = new FormData();
    formData.append("Title", payload.title);
    if (payload.image instanceof File && payload.image.size > 0) {
      formData.append("Image", payload.image);
    }        
    formData.append("Description", payload.description);
    formData.append("StartAt", payload.startAt);
    if (payload.endAt) formData.append("EndAt", payload.endAt);
    payload.category.forEach((cat) =>
      formData.append("Category", cat.toString())
    );
    formData.append("Status", payload.status.toString());
    formData.append("Direction.Street", payload.direction.street);
    formData.append(
      "Direction.StreetNumber",
      payload.direction.streetNumber.toString() 
    );
    formData.append("Direction.Corner", payload.direction.corner);
    formData.append("Direction.Department", payload.direction.department);
    formData.append("Direction.ZipCode", payload.direction.zipCode.toString());

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    

    const response = await fetch(
      `http://localhost:5015/api/1.0/auctions/${auctionId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(errorText);
      throw new Error(errorText  || "Error al actualizar subasta");
    }

    return "Subasta editada con éxito";
  } catch (err) {
    console.error("Error al actualizar la subasta:", err);
    throw err;
  }
}

// CREAR UN LOTE
export async function createLot(payload: FormLot) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const auctionId = payload.auctionId;
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("image", payload.image);
    formData.append("lotNumber", payload.lotNumber.toString());
    formData.append("description", payload.description);
    formData.append("details", payload.details);
    formData.append("startingPrice", payload.startingPrice.toString());
    formData.append("auctionId", auctionId);

    const response = await fetch(
      `http://localhost:5015/api/1.0/lots/${auctionId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Enviamos el token de autenticación
        },
        body: formData,
      }
    );
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
export async function getLotById(lotId: string) {
  const token = getToken();
  if (!token) throw new Error("No se encontró el token de autenticación.");

  try {
    const response = await fetch(
      `http://localhost:5015/api/1.0/lots/specific/${lotId}`,
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
      throw new Error(errorData.message || "Lote no encontrado.");
    }

    return await response.json();
  } catch (error) {
    console.error("No se pudo encontrar el lote:", error);
  }
}

// ACTUALIZAR LOTE
export async function updateLot(payload: FormLot) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    
    const lotId = payload.id;
    const formData = new FormData();
    
    // El request body es Form asi q cargamos el payload a un form
    if (payload.title) formData.append('title', payload.title);
    if (payload.lotNumber) formData.append('lotNumber', payload.lotNumber.toString());
    if (payload.description) formData.append('description', payload.description);
    if (payload.details) formData.append('details', payload.details);
    if (payload.startingPrice) formData.append('startingPrice', payload.startingPrice.toString());
    if (payload.auctionId) formData.append('auctionId', payload.auctionId);
    
    if (payload.image) { // Desde editLot se manda una URL no un File (cambiar)
      formData.append('image', payload.image);
    }
    
    const response = await fetch(
      `http://localhost:5015/api/1.0/lots/${lotId}/edit`,
      {
        method: "PUT",
        headers: {
          // Content-Type - el browser lo establece automaticamente
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error body:", errorData);
      throw new Error(errorData.message || "Error al actualizar lote");
    }
    
    return "Lote actualizado con éxito";
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
      `http://localhost:5015/api/1.0/lots/${auctioneer_id}`,
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
    console.log("Lotes en el storage:", storageData);
    return storageData;
  } catch (error) {
    console.error("Error al obtener el almacenamiento:", error);
    throw error;
  }
}

// HACER UNA PUJA EN UN LOTE
export async function makeBid(lotId: string, bid: number) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const dateNow = new Date();
    const response = await fetch(
      `http://localhost:5015/api/1.0/lots/bid/${lotId}`,
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
}

// HACER UNA AUTOPUJA
export async function makeAutoBid(
  lotId: string,
  maxBid: number,
  increasePrice: number
) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No se encontró el token de autenticación.");
    }
    const buyerId = getUserIdFromToken();
    if (!buyerId) {
      throw new Error("No se pudo obtener el ID del usario desde el token.");
    }

    // AUTOPUJA
    const response = await fetch(
      `http://localhost:5015/api/1.0/lots/auto-bid/${lotId}/${buyerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          increasePrice: increasePrice,
          maxBid: maxBid,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error desconocido al hacer la autopuja."
      );
    }
    return "✅ Autopuja realizada con éxito";
  } catch (error) {
    console.error("Error al hacer la autopuja:", error);
    throw error;
  }
}

// SELECCIONAR TODOS LAS SUBASTAS POR CATEGORIA
export async function getAuctionsByCategory(categoryId: number) {
  try {
    const response = await fetch(
      `http://localhost:5015/api/1.0/auctions/category/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al obtener las subastas por categoria."
      );
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error al obtener las subastas por categoria:", err);
    throw new Error("Error al obtener las subastas por categoria");
  }
}
