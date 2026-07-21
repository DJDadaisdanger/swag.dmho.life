# Backend Specification

This document outlines the required backend endpoints, data structures, and behaviors needed to support the `swag.dmho.life` frontend UI/UX.

The frontend expects a RESTful API returning JSON responses. Authentication should be handled via HTTP-only cookies (`access_token`). 

## Required Endpoints

### 1. Authentication

- **POST `/api/register`**
  - **Request Body:** `{ "email": "user@example.com", "password": "...", "phone": "1234567890" }`
  - **Response (200 OK):** `{ "message": "Account created", "email": "user@example.com" }`
  - **Behavior:** Create a new user, issue an HTTP-only cookie for session management.
  - **Errors:** 400 Bad Request if email exists, validation fails.

- **POST `/api/login`**
  - **Request Body:** `{ "email": "user@example.com", "password": "..." }`
  - **Response (200 OK):** `{ "message": "Logged in", "email": "user@example.com" }`
  - **Behavior:** Issue an HTTP-only cookie.
  - **Errors:** 401 Unauthorized.

- **POST `/api/logout`**
  - **Behavior:** Clear the authentication cookie.

- **GET `/api/me`**
  - **Response (200 OK - Authenticated):** `{ "authenticated": true, "user_id": 1, "email": "...", "name": "...", "address": "...", "phone": "..." }`
  - **Response (200 OK - Not Authenticated):** `{ "authenticated": false }`
  - **Behavior:** Used by the UI on initial load to determine if the user is logged in.

### 2. User Data (Cart & Wishlist Sync)

- **POST `/api/sync`**
  - **Request Body:** `{ "cart": [{ "id": 1, "selection": "M", "quantity": 1 }], "wishlist": [1, 2] }`
  - **Behavior:** Synchronizes the local offline cart and wishlist with the server.

- **GET `/api/cart`**
  - **Response (200 OK):** `{ "cart": [...], "wishlist": [...] }`
  - **Behavior:** Retrieves the user's saved cart and wishlist.

### 3. Checkout

- **POST `/api/checkout`**
  - **Request Body:** `{ "name": "John", "email": "...", "address": "...", "phone": "...", "cart": [...] }`
  - **Response (200 OK):** `{ "message": "Order placed", "order_id": "ORD-00001", "total": 199.00 }`
  - **Behavior:** Validates prices server-side, calculates bundle discounts, creates an order record, clears the user's cart in the DB.
  - **Critical Pricing Logic (Bundle Discounts):** The backend MUST apply a 10% discount on the following exact pairs when calculating the final total:
    - **Bundle 1:** Pair A Cover (ID: 9) + Pair A iPad Cover (ID: 12)
    - **Bundle 2:** Cute Cover (ID: 8) + Cute iPad Cover (ID: 11)
    - **Bundle 3:** Couple Goals (ID: 2) + Couple Goals (ID: 2)
    *(Discount applies per pair. E.g., if a user has two of ID 2, they get 10% off both. If they have four, they get 10% off all four, etc.)*

### 4. User Profile

- **GET `/api/profile`**
  - **Response (200 OK):** 
    ```json
    {
      "name": "John Doe",
      "email": "user@example.com",
      "address": "123 Street",
      "phone": "1234567890",
      "orders": [
        {
          "order_id": "ORD-00001",
          "date": "2023-10-25T12:00:00Z",
          "total": 199.00,
          "status": "Processing",
          "items": [{ "id": 1, "selection": "M", "quantity": 1 }]
        }
      ]
    }
    ```
  - **Behavior:** Returns profile details and order history.

- **PUT `/api/profile`**
  - **Request Body:** `{ "name": "...", "email": "...", "phone": "..." }`
  - **Response (200 OK):** `{ "message": "Profile updated successfully", "name": "...", "email": "...", "phone": "..." }`

- **POST `/api/profile/address`**
  - **Request Body:** `{ "address": "..." }`
  - **Response (200 OK):** `{ "message": "Address updated successfully", "address": "..." }`

### 5. Design Submissions

- **POST `/api/design-submissions`**
  - **Request Body:** `{ "name": "...", "email": "...", "vision": "..." }`
  - **Response (200 OK):** `{ "message": "Your vision has been submitted. We'll be in touch!" }`
  - **Behavior:** Saves custom design requests.

### 6. Products

- **GET `/api/products`**
  - **Response (200 OK):** `[ { "id": 1, "name": "Brainrot", "price": 199, "image": "assets/brainrot.webp", "category": "T-Shirts", "tags": ["crazy", "design"] }, ... ]`
  - **Behavior:** Returns the list of all available products.
  - **Note:** The frontend implements a client-side cache with a TTL (e.g. 5 minutes) to reduce server load for this endpoint.

## Database Entities (Suggested)

1. **User:** `id`, `email`, `password` (hashed), `name`, `address`, `phone`, `created_at`
2. **UserData:** `user_id`, `cart` (JSON/Text), `wishlist` (JSON/Text)
3. **Order:** `id`, `user_id`, `name`, `email`, `address`, `phone`, `cart` (JSON/Text), `total`, `status` (Processing, Shipped, Delivered), `created_at`
4. **DesignSubmission:** `id`, `customer_name`, `customer_email`, `design_vision`, `status`, `submitted_at`
5. **Product:** `id`, `name`, `price`, `image_url`, `category`, `tags` (JSON/Text)

## Implementation Notes
- Technology stack is entirely up to you (Node.js, Python, Go, etc.).
- The UI handles errors gracefully as long as a JSON response with a `detail` or `message` key is provided for 400/401/500 errors.
