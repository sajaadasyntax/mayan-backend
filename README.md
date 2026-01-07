# Mayan Shop - Backend API

Express.js backend API for the Mayan Shop e-commerce platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mayan_shop"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Set up database**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. **Seed the database** (optional)
   ```bash
   npm run prisma:seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create category (admin) |
| PUT | `/api/categories/:id` | Update category (admin) |
| DELETE | `/api/categories/:id` | Delete category (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |

### Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coupons` | List coupons (admin) |
| POST | `/api/coupons` | Create coupon (admin) |
| POST | `/api/coupons/validate` | Validate coupon |
| PUT | `/api/coupons/:id` | Update coupon (admin) |
| DELETE | `/api/coupons/:id` | Delete coupon (admin) |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get messages |
| POST | `/api/messages` | Send message |
| PUT | `/api/messages/:id/read` | Mark as read |

### Bank Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bank-accounts` | List bank accounts |
| POST | `/api/bank-accounts` | Create bank account (admin) |

### Support Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support` | Get support info |
| POST | `/api/support` | Create support info (admin) |

### Delivery Zones
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery-zones` | List delivery zones |
| GET | `/api/delivery-zones/price` | Get delivery price |
| POST | `/api/delivery-zones` | Create zone (admin) |

### Procurement
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/procurement` | List procurements (admin) |
| POST | `/api/procurement` | Create procurement (admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (admin) |
| GET | `/api/users/:id` | Get user by ID (admin) |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/:id/loyalty` | Update loyalty points (admin) |

## Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Default Admin Credentials

After seeding:
- **Phone**: +249123456789
- **Password**: admin123

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:seed      # Seed database
```

