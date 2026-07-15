import os
import json
import secrets
import html
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import aiosqlite
from dotenv import load_dotenv
from fastapi import Cookie, Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_hex(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "studio.db")

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI()

app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/css",    StaticFiles(directory="css"),    name="css")
app.mount("/js",     StaticFiles(directory="js"),     name="js")
app.mount("/webfonts", StaticFiles(directory="webfonts"), name="webfonts")


# ---------------------------------------------------------------------------
# DB init
# ---------------------------------------------------------------------------
async def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                email      TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password   TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Add columns if they do not exist
        try:
            await db.execute("ALTER TABLE users ADD COLUMN name TEXT")
        except Exception:
            pass
        try:
            await db.execute("ALTER TABLE users ADD COLUMN address TEXT")
        except Exception:
            pass
        try:
            await db.execute("ALTER TABLE users ADD COLUMN phone TEXT")
        except Exception:
            pass

        await db.execute("""
            CREATE TABLE IF NOT EXISTS user_data (
                user_id  INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                cart     TEXT NOT NULL DEFAULT '[]',
                wishlist TEXT NOT NULL DEFAULT '[]'
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
                name       TEXT,
                email      TEXT,
                address    TEXT,
                phone      TEXT,
                cart       TEXT NOT NULL,
                total      REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # Add status column to orders if it does not exist for order tracking
        try:
            await db.execute("ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'Processing'")
        except Exception:
            pass

        await db.execute("""
            CREATE TABLE IF NOT EXISTS design_submissions (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name  TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                design_vision  TEXT NOT NULL,
                submitted_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                status         TEXT DEFAULT 'Pending'
            )
        """)
        await db.commit()


@app.on_event("startup")
async def startup():
    await init_db()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    email: str
    password: str
    phone: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CartItem(BaseModel):
    id: int
    selection: str
    quantity: int

class SyncData(BaseModel):
    cart: List[CartItem]
    wishlist: List[int]

class CheckoutRequest(BaseModel):
    name: str
    email: str
    address: str
    phone: str
    cart: List[CartItem]

class DesignSubmissionRequest(BaseModel):
    name: str
    email: str
    vision: str

class UpdateAddressRequest(BaseModel):
    address: str

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str
    phone: str


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

async def get_current_user(access_token: Optional[str] = Cookie(None)):
    """Dependency — raises 401 if not authenticated."""
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(access_token)
        user_id = int(payload["sub"])
        email = payload["email"]
        return {"user_id": user_id, "email": email}
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------

@app.post("/api/register")
async def register(req: RegisterRequest, response: Response): #[cite: 1]
    if not req.email or not req.password: #[cite: 1]
        raise HTTPException(status_code=400, detail="Email and password are required") #[cite: 1]
    if len(req.password) < 6: #[cite: 1]
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters") #[cite: 1]
    
    # NEW: Prevent the 500 Internal Server Error crash
    if len(req.password.encode('utf-8')) > 72:
        raise HTTPException(status_code=400, detail="Password cannot exceed 72 bytes")

    import re
    if not re.match(r"^\d{10}$", req.phone.strip()):
        raise HTTPException(status_code=400, detail="Invalid 10-digit phone number")

    hashed = hash_password(req.password)
    
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            cursor = await db.execute(
                "INSERT INTO users (email, password, phone) VALUES (?, ?, ?)",
                (req.email.lower().strip(), hashed, req.phone.strip())
            )
            user_id = cursor.lastrowid
            await db.execute(
                "INSERT INTO user_data (user_id) VALUES (?)", (user_id,)
            )
            await db.commit() #[cite: 1]
    except aiosqlite.IntegrityError: #[cite: 1]
        raise HTTPException(status_code=400, detail="Email already registered") #[cite: 1]

    token = create_access_token(user_id, req.email.lower().strip()) #[cite: 1]
    _set_auth_cookie(response, token) #[cite: 1]
    return {"message": "Account created", "email": req.email.lower().strip()} #[cite: 1]


@app.post("/api/login")
async def login(req: LoginRequest, response: Response):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, email, password FROM users WHERE email = ?",
            (req.email.lower().strip(),)
        )
        row = await cursor.fetchone()

    if not row or not verify_password(req.password, row["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(row["id"], row["email"])
    _set_auth_cookie(response, token)
    return {"message": "Logged in", "email": row["email"]}


@app.post("/api/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@app.get("/api/me")
async def me(access_token: Optional[str] = Cookie(None)):
    if not access_token:
        return {"authenticated": False}
    try:
        payload = decode_token(access_token)
        user_id = int(payload["sub"])
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT email, name, address, phone FROM users WHERE id = ?",
                (user_id,)
            )
            row = await cursor.fetchone()
        if row:
            return {
                "authenticated": True,
                "user_id": user_id,
                "email": row["email"],
                "name": row["name"] or "",
                "address": row["address"] or "",
                "phone": row["phone"] or ""
            }
        return {"authenticated": False}
    except (JWTError, KeyError, ValueError):
        return {"authenticated": False}


# ---------------------------------------------------------------------------
# Cart / Wishlist sync
# ---------------------------------------------------------------------------
@app.post("/api/sync")
async def sync_data(data: SyncData, user=Depends(get_current_user)):
    cart_json = json.dumps([item.model_dump() for item in data.cart])
    wishlist_json = json.dumps(data.wishlist)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO user_data (user_id, cart, wishlist)
               VALUES (?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET cart=excluded.cart, wishlist=excluded.wishlist""",
            (user["user_id"], cart_json, wishlist_json)
        )
        await db.commit()
    return {"message": "Synced"}


@app.get("/api/cart")
async def get_cart(user=Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT cart, wishlist FROM user_data WHERE user_id = ?",
            (user["user_id"],)
        )
        row = await cursor.fetchone()
    if not row:
        return {"cart": [], "wishlist": []}
    return {
        "cart": json.loads(row["cart"]),
        "wishlist": json.loads(row["wishlist"])
    }


# ---------------------------------------------------------------------------
# Checkout
# ---------------------------------------------------------------------------
@app.post("/api/checkout")
async def checkout(req: CheckoutRequest, user=Depends(get_current_user)):
    if not req.cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    import re
    if not re.match(r"^\d{10}$", req.phone.strip()):
        raise HTTPException(status_code=400, detail="Invalid 10-digit phone number")

    # Calculate total server-side (in a real app validate against DB prices)
    PRICES = {1:199,2:299,3:249,4:149,5:229,6:279,7:199,8:399,9:459,10:429,11:599,12:659,13:629}
    total = sum(PRICES.get(item.id, 0) * item.quantity for item in req.cart)

    cart_json = json.dumps([item.model_dump() for item in req.cart])
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO orders (user_id, name, email, address, phone, cart, total) VALUES (?,?,?,?,?,?,?)",
            (user["user_id"], req.name, req.email, req.address, req.phone.strip(), cart_json, total)
        )
        order_id = cursor.lastrowid
        # Update name, address, and phone in user profile
        await db.execute(
            "UPDATE users SET name = ?, address = ?, phone = ? WHERE id = ?",
            (req.name, req.address, req.phone.strip(), user["user_id"])
        )
        # Clear server-side cart
        await db.execute(
            "UPDATE user_data SET cart='[]' WHERE user_id=?",
            (user["user_id"],)
        )
        await db.commit()

    return {"message": "Order placed", "order_id": f"ORD-{order_id:05d}", "total": total}


# ---------------------------------------------------------------------------
# Cookie helper
# ---------------------------------------------------------------------------
def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 86400,
        path="/"
    )


# ---------------------------------------------------------------------------
# Design submissions
# ---------------------------------------------------------------------------
@app.post("/api/design-submissions")
async def design_submissions(req: DesignSubmissionRequest):
    if not req.name.strip() or not req.vision.strip():
        raise HTTPException(status_code=400, detail="Name and design description/vision are required")
        
    import re
    if not re.match(r"[^@]+@[^@]+\.[^@]+", req.email.strip()):
        raise HTTPException(status_code=400, detail="Invalid email address format")

    name = html.escape(req.name.strip())
    email = req.email.lower().strip()
    vision = html.escape(req.vision.strip())
    
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO design_submissions (customer_name, customer_email, design_vision) VALUES (?, ?, ?)",
            (name, email, vision)
        )
        await db.commit()
        
    return {"message": "Your vision has been submitted. We'll be in touch!"}


# ---------------------------------------------------------------------------
# User Profile Dashboard endpoints
# ---------------------------------------------------------------------------
@app.get("/api/profile")
async def get_profile(user=Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        # Get user details
        cursor = await db.execute("SELECT email, name, address, phone FROM users WHERE id = ?", (user["user_id"],))
        user_row = await cursor.fetchone()
        
        # Get orders
        cursor = await db.execute(
            "SELECT id, created_at, cart, total, status FROM orders WHERE user_id = ? ORDER BY id DESC",
            (user["user_id"],)
        )
        order_rows = await cursor.fetchall()
        
    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")
        
    orders = []
    for row in order_rows:
        orders.append({
            "order_id": f"ORD-{row['id']:05d}",
            "date": row["created_at"],
            "total": row["total"],
            "status": row["status"] or "Processing",
            "items": json.loads(row["cart"])
        })
        
    return {
        "name": user_row["name"] or "",
        "email": user_row["email"],
        "address": user_row["address"] or "",
        "phone": user_row["phone"] or "",
        "orders": orders
    }

@app.put("/api/profile")
async def update_profile(req: ProfileUpdateRequest, user=Depends(get_current_user)):
    import re
    if not re.match(r"^\d{10}$", req.phone.strip()):
        raise HTTPException(status_code=400, detail="Invalid 10-digit phone number")
        
    if not re.match(r"[^@]+@[^@]+\.[^@]+", req.email.strip()):
        raise HTTPException(status_code=400, detail="Invalid email format")
        
    sanitized_name = html.escape(req.name.strip())
    sanitized_email = req.email.lower().strip()
    
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT id FROM users WHERE email = ? AND id != ?", (sanitized_email, user["user_id"]))
        existing = await cursor.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already in use")
            
        await db.execute(
            "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
            (sanitized_name, sanitized_email, req.phone.strip(), user["user_id"])
        )
        await db.commit()
        
    return {
        "message": "Profile updated successfully",
        "name": sanitized_name,
        "email": sanitized_email,
        "phone": req.phone.strip()
    }

@app.post("/api/profile/address")
async def update_address(req: UpdateAddressRequest, user=Depends(get_current_user)):
    if not req.address.strip():
        raise HTTPException(status_code=400, detail="Address cannot be empty")
        
    sanitized_address = html.escape(req.address.strip())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE users SET address = ? WHERE id = ?",
            (sanitized_address, user["user_id"])
        )
        await db.commit()
        
    return {"message": "Address updated successfully", "address": sanitized_address}


# ---------------------------------------------------------------------------
# MIME map for static file fallback
# ---------------------------------------------------------------------------
_MIME = {
    "html": "text/html", "css": "text/css", "js": "application/javascript",
    "json": "application/json", "png": "image/png", "jpg": "image/jpeg",
    "jpeg": "image/jpeg", "webp": "image/webp", "ico": "image/x-icon",
    "svg": "image/svg+xml", "woff": "font/woff", "woff2": "font/woff2",
    "ttf": "font/ttf",
}

@app.get("/")
async def serve_index():
    with open(os.path.join(os.getcwd(), "index.html"), "rb") as f:
        return Response(content=f.read(), media_type="text/html")

@app.get("/{full_path:path}")
async def serve_static(full_path: str):
    file_path = os.path.join(os.getcwd(), full_path)
    if os.path.isfile(file_path):
        ext = full_path.rsplit(".", 1)[-1].lower() if "." in full_path else ""
        with open(file_path, "rb") as f:
            return Response(content=f.read(), media_type=_MIME.get(ext, "application/octet-stream"))
    raise HTTPException(status_code=404, detail="Not found")
