import type { Auction } from "./types";

export async function getAuctionById(id: number): Promise<Auction> {
  const mockData: Record<number, Auction> = {
    1: {
      id: 1,
      title: "Subasta de autos deportivos",
      description: "Ferrari, Lamborghini y más...",
      category: ["Autos", "Lujo"],
      status: 1,
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      auctioneer: {
        id: 101,
        first_name: "Carlos",
        last_name: "Sánchez",
        email: "carlos@remates.com",
      },
      lots: [
        {
          id: 11,
          lot_number: 1,
          description: "Ferrari F8 Tributo",
          details: "V8, año 2020, rojo italiano.",
          starting_price: 200000,
          ending_price: 0,
          current_price: 210000,
          winner: null,
        },
        {
          id: 12,
          lot_number: 2,
          description: "Porsche 911 Turbo S",
          details: "Año 2022, 6.000 km.",
          starting_price: 180000,
          ending_price: 0,
          current_price: 185000,
          winner: null,
        },
      ],
    },
    2: {
      id: 2,
      title: "Subasta de tecnología premium",
      description: "MacBooks, iPhones y más",
      category: ["Electrónica"],
      status: 1,
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      auctioneer: {
        id: 102,
        first_name: "Laura",
        last_name: "Fernández",
        email: "laura@tecremates.com",
      },
      lots: [
        {
          id: 21,
          lot_number: 1,
          description: "MacBook Pro M2",
          details: "16”, 32GB RAM, 1TB SSD.",
          starting_price: 2500,
          ending_price: 0,
          current_price: 2700,
          winner: null,
        },
        {
          id: 22,
          lot_number: 2,
          description: "iPhone 15 Pro Max",
          details: "256GB, titanio natural.",
          starting_price: 1500,
          ending_price: 0,
          current_price: 1620,
          winner: null,
        },
      ],
    },
    3: {
      id: 3,
      title: "Obras de arte",
      description: "Esculturas y pinturas originales",
      category: ["Arte"],
      status: 1,
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      auctioneer: {
        id: 103,
        first_name: "Marcos",
        last_name: "Díaz",
        email: "marcos@galeriaviva.com",
      },
      lots: [
        {
          id: 31,
          lot_number: 1,
          description: "“Atardecer en el río”",
          details: "Óleo sobre lienzo, 90x70 cm, autor: M. Valdés.",
          starting_price: 800,
          ending_price: 0,
          current_price: 890,
          winner: null,
        },
        {
          id: 32,
          lot_number: 2,
          description: "Escultura 'El vuelo'",
          details: "Bronce fundido, 50 cm de alto.",
          starting_price: 1200,
          ending_price: 0,
          current_price: 1320,
          winner: null,
        },
      ],
    },
  };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockData[id]) {
        resolve(mockData[id]);
      } else {
        reject(new Error("Subasta no encontrada"));
      }
    }, 500);
  });
}
