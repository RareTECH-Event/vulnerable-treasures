import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

// Ensure the path is correct when running from the project root
const db = new Database(path.join("db", "database.db"));

// Users Table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  );
`);

// Products Table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    price REAL,
    image TEXT,
    is_public INTEGER DEFAULT 1
  );
`);

// Comments Table
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    username TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Flags Table
db.exec(`
  CREATE TABLE IF NOT EXISTS flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    value TEXT,
    is_captured INTEGER DEFAULT 0
  );
`);

// Insert initial data
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_secrets (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);
const insertUser = db.prepare(
	"INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
);
// Admin's real password is stored separately; users.password has only a hint
insertUser.run("admin", "It's not here. Find admin secret data.", "admin");
// Store non-admin user passwords as hashes to avoid leaking usable plaintext via SQLi
insertUser.run(
	"alice",
	"sha256:ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
	"user",
); // hash of password123
insertUser.run("bob", "sha256:2f0ef870f09550a63a6d4bb4d9163e11", "user"); // example hash

const insertProduct = db.prepare(
	"INSERT OR IGNORE INTO products (name, description, price, image, is_public) VALUES (?, ?, ?, ?, ?)",
);
insertProduct.run(
	"Ancient Vase",
	"A beautifully crafted vase from a lost civilization.",
	120.0,
	"https://placehold.co/600x400/E2D8C0/5D432C?text=Vase",
	1,
);
insertProduct.run(
	"Golden Goblet",
	"A goblet made of pure gold, rumored to grant eternal youth.",
	1500.0,
	"https://placehold.co/600x400/FFD700/8B4513?text=Goblet",
	1,
);
insertProduct.run(
	"Crystal Skull",
	"A mysterious crystal skull, said to hold ancient secrets.",
	5000.0,
	"https://placehold.co/600x400/AFEEEE/2F4F4F?text=Skull",
	1,
);
insertProduct.run(
	"Secret Treasure Map",
	"A map leading to an unknown treasure. (Private) FLAG: CTF{S3cr3t_Tr34sur3_M4p_F0und}",
	9999.99,
	"https://placehold.co/600x400/DEB887/8B4513?text=Map",
	0,
);

const insertComment = db.prepare(
	"INSERT OR IGNORE INTO comments (product_id, username, comment) VALUES (?, ?, ?)",
);
insertComment.run(
	1,
	"alice",
	"This vase is amazing! Looks great in my living room.",
);
insertComment.run(1, "bob", "I wish I could afford this.");
insertComment.run(2, "alice", "Is this real gold?");

const insertFlag = db.prepare(
	"INSERT OR IGNORE INTO flags (name, value) VALUES (?, ?)",
);
function addEncFlag(name: string, encBase64: string) {
	insertFlag.run(name, encBase64);
}
// Tutorial first (easy on-ramp)
addEncFlag(
	"Tutorial",
	"fUlg4VfiQHdDkc89tYCUe5ylWkQuItLapP0Z3EEJX/Wd4qc76I+cUs8ebhkaraui",
);
addEncFlag(
	"SQL Injection - Auth Bypass",
	"QjLNMkAGDwdoDPyRivkYjHo+igsdrfYHgVJHOwcy9Ys=",
);
addEncFlag(
	"SQL Injection - Information Leakage",
	"R1KpqZteqhj5oaerw6pezBbrEk6pPqdEA3fgLy93zRI=",
);
addEncFlag("Stored XSS", "zvMPnVXOpV3wYK3kfkP4X+Axmbbcn6SRAW2drqS+jWc=");
addEncFlag("Reflected XSS", "oxqCgFs8fH7NR2p/fZOpjJWn+aequ0rR616NIX2UbPQ=");
addEncFlag(
	"IDOR",
	"1/5Nd77gYr2ZGzLZRYVU+EhLI0mOJ/FgdiPNSsmaGZIvLYQKmmGn3OFmEf8WOvfe",
);
addEncFlag("Path Traversal", "fUb6H+duYPOx8f6cmpDGQfICcs7EfjZG63giRa7ZBD8=");
addEncFlag("Command Injection", "pgQUsiKUoPCRVUjPyquuUUQZ3Xentu1x7SsXdtp5mx8=");
addEncFlag(
	"XXE",
	"7XCbw30ajDbELoMe7s3UM984iBc2T5u04X9tJG3SWOzwy3Rny0mB16t57y6SKPU7",
);
addEncFlag(
	"Brute Force",
	"uUjcWSfns66CxBM5yII928gd1DdWivJCKpaxvOM1neHh3vS5tRAwZQTFPr4E5gch",
);
addEncFlag(
	"Admin Password",
	"je1e2vgTxk1aCbfjH75Z485EdF4ACklb/+RYslFBgMPIovJiawue3R+o9FmqTQYM",
);
addEncFlag(
	"SSRF",
	"z7G0zDUpftHPdeHI3AonZbDZnVKbBh/fojEGkYF9w4+p/lhtHxRwtdLmhSA23HMk",
);
addEncFlag(
	"Crawler Footprints",
	"0M/hiQ7hkl9HsuB36eoZfe8aQ/2Lsv89IfVVJdzZu0Y=",
);

// Admin secret table seed
const upsertSecret = db.prepare(
	"INSERT OR REPLACE INTO admin_secrets (key, value) VALUES (?, ?)",
);
const ADMIN_PW = process.env.ADMIN_PASSWORD ||
  `Adm1n!_${crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`;
upsertSecret.run("admin_password", ADMIN_PW);

console.log("Database initialized successfully.");
db.close();
