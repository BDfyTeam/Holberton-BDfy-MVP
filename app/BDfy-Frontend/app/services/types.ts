import type { JSX } from "react/jsx-runtime";

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
  winner?: string | null;
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
  lotNumber: number;
  description: string;
  details: string;
  startingPrice: number;
  endingPrice?: number;
  currentPrice?: number; 
  winner?: string | null;
}

// Type para auction y tipar correctamente el useState
export interface Auction {
  id?: string;
  title: string;
  description: string;
  category: number[];
  startAt: string;
  endAt?: string;
  status: number;
  direction: {
    street: string;
    streetNumber: number;
    corner: string;
    zipCode: number;
    department: string;
  };
  auctioneer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  lots: Lot[];
}

// TIPO BASICO PARA UNA CARD
export type BasicCardItem = {
  id: string,
  title: string;
  description: string;
  category?: number[];
  image?: string;
}