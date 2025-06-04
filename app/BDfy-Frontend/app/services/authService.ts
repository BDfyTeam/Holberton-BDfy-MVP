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
