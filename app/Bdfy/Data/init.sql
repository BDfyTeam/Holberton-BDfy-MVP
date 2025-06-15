CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    ci TEXT NOT NULL,
    reputation INT NOT NULL CHECK (reputation BETWEEN 0 AND 100),
    phone TEXT NOT NULL,
    role INT NOT NULL,
    direction_street TEXT NOT NULL,
    direction_street_number INT NOT NULL,
    direction_corner TEXT NOT NULL,
    direction_zip_code INT NOT NULL,
    direction_department TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS userdetails (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    is_admin BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auctioneerdetails (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    plate INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    category INTEGER[],
    status INT NOT NULL,
    direction_street TEXT NOT NULL,
    direction_street_number INT NOT NULL,
    direction_corner TEXT NOT NULL,
    direction_zip_code INT NOT NULL,
    direction_department TEXT NOT NULL,
    auctioneer_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (auctioneer_id) REFERENCES auctioneerdetails(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category INTEGER[] NOT NULL,
    initial_price DECIMAL NOT NULL,
    current_price DECIMAL,
    status INT NOT NULL,
    auction_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY,
    amount DECIMAL NOT NULL,
    lot_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
