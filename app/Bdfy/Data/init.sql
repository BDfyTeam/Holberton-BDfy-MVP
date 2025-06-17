-- Tabla Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    ci TEXT NOT NULL,
    reputation INT NOT NULL CHECK (reputation BETWEEN 0 AND 100),
    phone TEXT NOT NULL,
    role INT NOT NULL, -- UserRole: Buyer=0, Auctioneer=1

    -- Propiedad embebida Direction
    direction_street TEXT NOT NULL,
    direction_street_number INT NOT NULL,
    direction_corner TEXT NOT NULL,
    direction_zip_code INT NOT NULL,
    direction_department TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Tabla UserDetails
CREATE TABLE IF NOT EXISTS userdetails (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    is_admin BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla AuctioneerDetails
CREATE TABLE IF NOT EXISTS auctioneerdetails (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    plate INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla Auctions
CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    category INTEGER[],
    status INT NOT NULL, -- AuctionStatus: Closed=0, Active=1, Draft=2

    -- Propiedad embebida Direction
    direction_street TEXT NOT NULL,
    direction_street_number INT NOT NULL,
    direction_corner TEXT NOT NULL,
    direction_zip_code INT NOT NULL,
    direction_department TEXT NOT NULL,

    auctioneer_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (auctioneer_id) REFERENCES auctioneerdetails(id) ON DELETE RESTRICT
);

-- Tabla Lots
CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY,
    lot_number INT NOT NULL CHECK (lot_number > 0),
    description TEXT NOT NULL,
    details TEXT NOT NULL,
    starting_price DECIMAL(19,4) NOT NULL CHECK (starting_price >= 0),
    current_price DECIMAL(19,4) CHECK (current_price >= 0),
    ending_price DECIMAL(19,4) CHECK (ending_price >= 0),
    sold BOOLEAN NOT NULL,

    auction_id UUID NOT NULL,
    winner_id UUID,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES userdetails(id) ON DELETE SET NULL
);

-- Tabla Bids
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY,
    amount DECIMAL(19,4) NOT NULL CHECK (amount >= 0),
    time TIMESTAMPTZ NOT NULL,

    lot_id UUID NOT NULL,
    buyer_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES userdetails(id) ON DELETE CASCADE
);
