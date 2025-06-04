export async function loginUser(email: string, password: string) {
  try {
    // Llamamos al back con los datos del formulario
    const response = await fetch("http://localhost:5015/api/v1.0/users/login", {
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
    return data.Token;
  } catch (error) {
    throw error;
  }
}
