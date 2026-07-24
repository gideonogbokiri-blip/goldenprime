# GoldenPrime — GPG Coin Investment Platform

## Overview

GoldenPrime is a crypto investment platform where users **preorder GoldenPrime Gold Coin (GPG)** at $50 per coin. Users fund their wallets, preorder GPG via bank transfer or card, earn referral rewards (0.0001 GPG per referral), and manage everything through a full-featured admin panel.

**Launch date:** October 1, 2026
**Total supply:** 1,000,000 GPG
**Price per coin:** $50 USD

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 4, bcrypt, JWT |
| Database | PostgreSQL via Supabase (REST API) |
| External APIs | CoinGecko (live crypto prices), Stripe (card payments, placeholder) |
| Email | Nodemailer / SMTP (not yet configured) |

---

## Project Structure

```
goldenprime/
├── backend/
│   ├── data/
│   │   └── user_settings.json          # Local file storage (bank/card/referral)
│   ├── src/
│   │   ├── app.js                      # Express entry point (port 5001)
│   │   ├── config/
│   │   │   ├── supabase.js             # Supabase client
│   │   │   ├── schema.sql              # Database schema
│   │   │   └── migrate.js              # Migration script
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, verify, reset
│   │   │   ├── walletController.js     # Wallet balance, fund
│   │   │   ├── tradingController.js    # Buy/sell crypto
│   │   │   ├── kycController.js        # KYC submission & review
│   │   │   ├── adminController.js      # Admin dashboard, preorders, KYC
│   │   │   ├── depositController.js    # Bank/crypto deposit requests
│   │   │   └── preorderController.js   # GPG preorders, portfolio, referrals
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT authentication middleware
│   │   │   └── errorHandler.js         # Global error handler
│   │   ├── models/
│   │   │   ├── User.js                 # User CRUD
│   │   │   ├── Wallet.js               # Wallet balance CRUD
│   │   │   ├── Transaction.js          # Transaction CRUD
│   │   │   ├── KYC.js                  # KYC submissions
│   │   │   ├── AdminLog.js             # Admin audit logs
│   │   │   ├── Referral.js             # Referral codes, credits, leaderboard
│   │   │   └── UserSettings.js         # Bank/card/referral (local JSON file)
│   │   ├── routes/
│   │   │   ├── auth.js                 # /api/auth/*
│   │   │   ├── wallet.js               # /api/wallet/*
│   │   │   ├── crypto.js               # /api/crypto/*
│   │   │   ├── trading.js              # /api/trading/*
│   │   │   ├── kyc.js                  # /api/kyc/*
│   │   │   ├── deposit.js              # /api/deposits/*
│   │   │   ├── preorder.js             # /api/gold/*
│   │   │   └── admin.js                # /api/admin/*
│   │   └── services/
│   │       ├── authService.js          # Register (with referral), login, verify
│   │       ├── cryptoService.js        # CoinGecko prices with fallback
│   │       ├── tradingService.js       # Buy/sell crypto
│   │       ├── preorderService.js      # GPG preorder logic
│   │       ├── depositService.js       # Bank transfer & crypto deposits
│   │       ├── paymentDetailsService.js # Save/get bank & card details
│   │       ├── paymentService.js       # Stripe (placeholder)
│   │       ├── emailService.js         # Nodemailer (unconfigured)
│   │       └── adminService.js         # Admin CRUD
│   └── .env                            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── login/page.tsx          # Sign in
│   │   │   ├── register/page.tsx       # Register (supports ?ref= referral)
│   │   │   ├── dashboard/page.tsx      # Portfolio dashboard
│   │   │   ├── preorder/page.tsx       # Buy GPG ($50/coin)
│   │   │   ├── wallet/page.tsx         # Fund wallet, transactions
│   │   │   ├── referrals/page.tsx      # Referral code, leaderboard
│   │   │   ├── profile/page.tsx        # Account info, payment details
│   │   │   ├── kyc/page.tsx            # Identity verification
│   │   │   ├── trade/page.tsx          # Redirects to /preorder
│   │   │   ├── deposit/page.tsx        # Redirects to /preorder
│   │   │   └── admin/page.tsx          # Admin panel
│   │   ├── components/
│   │   │   ├── CryptoPrices.tsx        # Live crypto prices (30s refresh)
│   │   │   ├── WalletCard.tsx          # USD balance display
│   │   │   └── Portfolio.tsx           # Holdings display
│   │   └── lib/
│   │       └── api.ts                  # Axios client (authAPI, goldAPI, etc.)
│   ├── .env.local                      # NEXT_PUBLIC_API_URL=http://localhost:5001/api
│   └── tailwind.config.ts              # Gold color palette
└── README.md
```

---

## Setup & Running

### Backend (port 5001)

```bash
cd backend
npm install
node src/app.js
```

### Frontend (port 3000)

```bash
cd frontend
npm install
npx next dev -p 3000
```

### Environment Variables (`backend/.env`)

```
PORT=5001
SUPABASE_URL=https://aiieutuxceyknyhubkzf.supabase.co
SUPABASE_ANON_KEY=<anon-key>
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<refresh-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register with email, password, name, optional `referralCode` |
| POST | `/login` | No | Login, returns JWT + user role |
| GET | `/verify-email?token=` | No | Verify email address |
| POST | `/forgot-password` | No | Request password reset email |
| POST | `/reset-password` | No | Reset password with token |
| GET | `/me` | Yes | Get current user profile |

### Wallet (`/api/wallet`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get all wallets (GPG, USD, BTC, etc.) |
| POST | `/fund` | Yes | Dev fund wallet (bypasses payment) |
| GET | `/transactions` | Yes | Transaction history |

### Crypto Prices (`/api/crypto`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/prices` | No | Live prices from CoinGecko (BTC, ETH, SOL, etc.) |
| GET | `/prices/:coinId` | No | Single coin price |

### Trading (`/api/trading`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/buy` | Yes | Buy crypto with USD |
| POST | `/sell` | Yes | Sell crypto for USD |
| GET | `/portfolio` | Yes | View holdings |

### GPG Preorder (`/api/gold`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/coin` | No | GPG coin info ($50, supply, sold, remaining) |
| POST | `/preorder` | Yes | Preorder GPG via bank transfer or card |
| GET | `/my` | Yes | My preorder history |
| GET | `/portfolio` | Yes | My GPG + USD holdings + total value |
| GET | `/referral` | Yes | My referral code, count, earnings |
| GET | `/leaderboard` | No | Top referrers ranked |
| GET | `/bank-details` | Yes | My saved bank details |
| GET | `/card-details` | Yes | My saved card details |

**Preorder request body:**
```json
{
  "amount": 200,
  "paymentMethod": "bank_transfer",
  "bankName": "GTBank",
  "accountNumber": "0123456789",
  "accountName": "John Doe"
}
```

Or for card:
```json
{
  "amount": 100,
  "paymentMethod": "card",
  "cardHolder": "John Doe",
  "cardLast4": "4321",
  "bankName": "GTBank"
}
```

### Deposits (`/api/deposits`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request` | Yes | Request a deposit (bank or crypto) |
| GET | `/my` | Yes | My deposit history |
| GET | `/instructions/:id` | Yes | Payment instructions for a deposit |

### KYC (`/api/kyc`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/submit` | Yes | Submit identity document |
| GET | `/status` | Yes | Check KYC status |

### Admin (`/api/admin`) — Requires `role=admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/overview` | Admin | Dashboard stats (users, revenue, logs) |
| GET | `/users` | Admin | List all users with payment details |
| GET | `/preorders` | Admin | All GPG preorders |
| PUT | `/preorders/:id/approve` | Admin | Approve a preorder (credits GPG to wallet) |
| PUT | `/preorders/:id/reject` | Admin | Reject a preorder |
| GET | `/deposits` | Admin | All deposit requests |
| PUT | `/deposits/:id/approve` | Admin | Approve deposit (credits USD wallet) |
| PUT | `/deposits/:id/reject` | Admin | Reject deposit |
| GET | `/transactions` | Admin | All transactions |
| GET | `/kyc` | Admin | All KYC submissions |
| PUT | `/kyc/:id/approve` | Admin | Approve KYC |
| PUT | `/kyc/:id/reject` | Admin | Reject KYC |
| GET | `/logs` | Admin | Admin action audit logs |

---

## Database Schema (Supabase)

### Tables

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | bcrypt hash |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| role | VARCHAR | `user` or `admin` |
| is_verified | BOOLEAN | Email verified |
| verification_token | VARCHAR | For email verification |
| reset_token | VARCHAR | For password reset |
| reset_token_expires | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**wallets**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| currency | VARCHAR | GPG, USD, BTC, ETH, SOL |
| balance | DECIMAL | Current balance |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**transactions**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| type | VARCHAR | preorder, deposit, withdrawal, trade_buy, trade_sell, referral_reward |
| currency | VARCHAR | |
| amount | DECIMAL | |
| usd_value | DECIMAL | USD equivalent |
| status | VARCHAR | pending, completed, rejected |
| metadata | JSONB | Flexible data (payment details, coin info, etc.) |
| created_at | TIMESTAMP | |

**kyc**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| full_name | VARCHAR | |
| date_of_birth | DATE | |
| country | VARCHAR | |
| document_type | VARCHAR | passport, national_id, drivers_license |
| document_number | VARCHAR | |
| status | VARCHAR | pending, approved, rejected |
| reviewed_by | UUID | FK → users |
| reviewed_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

**admin_logs**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| admin_id | UUID | FK → users |
| action | VARCHAR | |
| target_type | VARCHAR | user, transaction, kyc |
| target_id | UUID | |
| details | JSONB | |
| created_at | TIMESTAMP | |

### Local File Storage (`backend/data/user_settings.json`)

Since the Supabase project doesn't allow direct table creation via API, user settings are stored in a local JSON file:

```json
{
  "<user_id>": {
    "referral_code": "GP-XXXXXXXX",
    "referred_by": "<referrer_user_id>",
    "bank_details": {
      "bankName": "GTBank",
      "accountNumber": "0123456789",
      "accountName": "John Doe"
    },
    "card_details": {
      "last4": "4321",
      "cardHolder": "John Doe",
      "expiryMonth": "12",
      "expiryYear": "2028",
      "bankName": "GTBank"
    }
  }
}
```

---

## Key Features

### 1. GPG Coin Preordering
- Price: $50 per GPG coin
- Minimum order: $50 (1 coin)
- Maximum order: $100,000
- Payment methods: bank transfer or card
- Admin approves/rejects each preorder
- On approval, GPG credited to user's wallet

### 2. Referral System
- Every user gets a unique referral code (format: `GP-XXXXXXXX`)
- Register with `?ref=GP-XXXXXXXX` to apply referral
- Referrer earns **0.0001 GPG** per successful referral signup
- Leaderboard tracks top referrers

### 3. Live Crypto Prices
- Fetched from CoinGecko API every 30 seconds
- Displays BTC, ETH, SOL, and other major coins
- Fallback prices if API is unreachable
- Shown on dashboard and preorder pages

### 4. Admin Panel
- Overview dashboard with user count, revenue, transaction stats
- Manage users (view saved bank/card details)
- Approve/reject GPG preorders
- Approve/reject deposits
- Review KYC submissions
- Full audit log of admin actions

### 5. KYC Verification
- Submit passport, national ID, or driver's license
- Stores full name, DOB, country, document type/number
- Admin reviews and approves/rejects

### 6. Wallet System
- GPG wallet (gold coin balance)
- USD wallet (fiat balance)
- Crypto wallets (BTC, ETH, SOL)
- Transaction history for all wallets

---

## Test Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| test@goldenprime.com | Test1234 | admin | Admin panel access |
| alice@test.com | Pass1234! | user | Test user with history |
| demo@goldenprime.com | - | user | Earlier test account |

---

## Known Limitations

1. **No real payment processing** — Stripe is placeholder; card entries are simulated
2. **No SMTP configured** — Verification/reset emails fail silently
3. **No `user_settings` table in Supabase** — Uses local JSON file instead (lost on redeploy)
4. **No real crypto wallet addresses** — Awaiting user to provide platform wallet addresses
5. **No deposits table** — Deposit requests stored in transactions table as `type=deposit`
6. **CoinGecko intermittent** — API may be unreachable from some networks (fallback prices provided)

---

## Next Steps

1. Add real crypto wallet addresses for deposits (BTC, ETH, SOL, USDT)
2. Add real bank transfer details for the platform
3. Configure Stripe for live card payments
4. Configure SMTP for email verification/reset
5. Create `user_settings` table in Supabase for persistent storage
6. Enhanced gold theme styling
7. Deployment (Vercel frontend, Railway/Render backend)
