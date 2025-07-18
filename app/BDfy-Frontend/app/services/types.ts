import type { JSX } from "react/jsx-runtime";

// REGISTRO DE USARIO Y SUBASTADOR
export type RegisterUser = {
  id?: string;
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
    corner: string;
    zipCode: number;
    department: string;
  };
  userDetails: {
    IsAdmin: boolean;
  };
};

export type RegisterAuctioneer = {
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
    corner: string;
    zipCode: number;
    department: string;
  };
  auctioneerDetails: {
    plate: number;
    auctionHouse: string;
  };
};



// MODELO DE LA AUCTIONCARD
export type AuctionForm = {
  id?: string;
  title: string;
  image: File;
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
export type FormLot = {
  id?: string,
  title: string;
  image: File;
  lotNumber: number;
  description: string;
  details: string;
  startingPrice: number;
  auctionId: string;
};

// LOTE COMPLETO
export type CompleteLot = {
  id: string;
  title: string;
  lotNumber: number;
  imageUrl: File;
  description: string;
  details: string;
  startingPrice: number;
  currentPrice: number;
  endingPrice: number;
  sold: boolean;
  winnerId?: string | null;
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
  title: string;
  imageUrl: string;
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
  imageUrl: string | File;
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
  auctioneer: Auctioneer;
  lots: Lot[];
}

// TIPO PARA EL TIPO QUE VENDE COSAS
export type Auctioneer = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ci: string;
  reputation: number;
  phone: string;
  role: number;
  imageUrl: string;
  direction: {
    street: string;
    streetNumber: number;
    corner: string;
    zipCode: number;
    department: string;
  };
  id: string;
  auctionHouse: string;
  plate: number
}

export type Winner = {
  firstName: string;
  lastName: string;
  id: string;
}

// TIPO BASICO PARA UNA CARD
export type BasicCardItem = {
  id: string;
  title: string;
  description: string;
  category?: number[];
  imageUrl?: string;
}