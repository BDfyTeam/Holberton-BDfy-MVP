// REGISTRO DE USARIO Y SUBASTADOR
export type RegisterUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ci: string;
  reputation: number;
  phone: string;
  role: number;
  direction: {
    street: string;
    streetNumber: number;
    zipCode: number;
    department: string;
  };
  userDetails: {
    IsAdmin: boolean;
  };
};

export type RegisterAuctioneerPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ci: string;
  reputation: number;
  phone: string;
  role: number;
  direction: {
    street: string;
    streetNumber: number;
    zipCode: number;
    department: string;
  };
  auctioneerDetails: {
    plate: number;
  };
};

// MODELO DE LA AUCTIONCARD
export type AuctionCard = {
  id?: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  category: number[];
  status: number;
  direction: {
    street: string;
    streetNumber: number;
    corner: string;
    zipCode: number;
    department: string;
  };
};

// MODELOS PARA LOTES
export type LotCard = {
  id?: string,
  lotNumber: number;
  description: string;
  startingPrice: number;
  details: string;
  auctionId: string;
};

// LOTE COMPLETO
export type CompleteLot = {
  id: string;
  lotNumber: number;
  description: string;
  details: string;
  startingPrice: number;
  currentPrice: number;
  endingPrice: number;
  sold: boolean;
  auction: {
    id: string;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    category: number[];
    status: number;
    auctioneerId: string;
    auctioneer: {
      userId: string;
      plate: number;
    };
  };
};

// Type para lot y tipar correctamente el useState
export interface Lot {
  id: string;
  lot_number: number;
  description: string;
  details: string;
  starting_price: number;
  ending_price: number;
  current_price?: number; // opcional si lo calculás en tiempo real
  winner: string | null;
}

// Type para auction y tipar correctamente el useState
export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string[];
  start_at: string;
  end_at: string;
  status: number;
  auctioneer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  lots: Lot[];
}
