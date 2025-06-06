


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
    details: {
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
    details: {
        plate: number;
    };
};

// Type para lot y tipar correctamente el useState
export interface Lot {
  id: number;
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
  id: number;
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
