export async function getAuctionById(id: number) {
  const response = await fetch(`/api/v1.0/auctions/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener la subasta");
  }

  const data = await response.json();
  return data;
}
