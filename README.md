# PropertyHub - Estate Agent Property Listing SaaS

A multi-tenant SaaS platform for estate agents to display and manage their property listings. Built with Next.js 14, PostgreSQL, and Prisma.

## Features

- **Multi-tenant Architecture**: Multiple agencies on one platform, each with isolated data
- **Property Management**: Full CRUD for properties with images, details, and status tracking
- **Public Property Portal**: Map and list views with advanced search and filtering
- **Enquiry System**: Capture and manage enquiries from potential buyers/tenants
- **White-labelling**: Per-agency branding (logo, colors, custom styling)
- **User Roles**: Platform Admin, Agency Admin, and Agent roles
- **Authentication**: Email/password auth with NextAuth.js

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Maps**: Leaflet with OpenStreetMap
- **UI Components**: Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Real-Estate-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   # Database connection string
   DATABASE_URL="postgresql://user:password@localhost:5432/property_saas?schema=public"

   # NextAuth secret (generate with: openssl rand -base64 32)
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After running the seed script, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | admin@propertyhub.com | admin123 |
| Agency Admin (London) | admin@londonprime.co.uk | password123 |
| Agent (London) | agent@londonprime.co.uk | password123 |
| Agency Admin (Manchester) | admin@manchesterhomes.co.uk | password123 |

## Public Demo Sites

- London Prime Estates: [/agency/london-prime-estates](http://localhost:3000/agency/london-prime-estates)
- Manchester Homes: [/agency/manchester-homes](http://localhost:3000/agency/manchester-homes)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database and reseed |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login)
│   ├── admin/             # Platform admin pages
│   ├── agency/[slug]/     # Public agency pages
│   ├── api/               # API routes
│   └── dashboard/         # Agency dashboard pages
├── components/            # React components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── map/              # Map components (Leaflet)
│   ├── property/         # Property-related components
│   └── ui/               # Base UI components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility functions and configs
│   ├── auth/            # Authentication config
│   └── ...
└── types/               # TypeScript types
```

## User Roles

### Platform Admin
- Manage all agencies (create, suspend, configure)
- View platform-wide statistics
- Configure global settings

### Agency Admin
- Manage agency profile and branding
- Manage team members (agents)
- Full access to properties and enquiries

### Agent
- Create and edit properties
- Manage enquiries
- View dashboard

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/properties` | List/create properties |
| GET/PUT/DELETE | `/api/properties/[id]` | Get/update/delete property |
| GET/POST | `/api/enquiries` | List/create enquiries |
| GET/PUT/DELETE | `/api/enquiries/[id]` | Get/update/delete enquiry |
| GET/POST | `/api/agencies` | List/create agencies (admin) |
| GET/PUT/DELETE | `/api/agencies/[id]` | Get/update/delete agency |
| GET/POST | `/api/users` | List/create users |
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Base URL for NextAuth | Yes |
| `EMAIL_SERVER_*` | SMTP settings for magic links | No |
| `UPLOAD_PROVIDER` | File upload provider (future) | No |
| `STRIPE_*` | Stripe API keys (future) | No |

## Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t property-hub .

# Run with Docker Compose
docker-compose up -d
```

## Future Enhancements

The codebase is structured to easily add:

- **Stripe Billing**: Payment integration for subscription plans
- **Custom Domains**: Allow agencies to use their own domain
- **Advanced Geo Search**: Radius search, draw-on-map search
- **Email Notifications**: Automated enquiry notifications
- **File Upload**: Integration with S3/Cloudinary for images
- **Portal Feeds**: Rightmove/Zoopla XML feeds
- **Analytics**: Property view tracking, conversion metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
