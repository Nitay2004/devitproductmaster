# ProductMaster Pro

Enterprise Product & Spare Parts Management system built with Next.js, Prisma, and Supabase.

## Features

- **Inventory Management**: Track products and spare parts with detailed specifications.
- **Authentication**: Secure login/signup with session management.
- **User Profile**: Interactive user profile in sidebar and header.
- **Bulk Upload**: Import data from Excel files.
- **Global Search**: Quick access to products and parts across the system.
- **Responsive Dashboard**: Beautiful, modern UI optimized for all devices.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **ORM**: [Prisma](https://prisma.io)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4.0
- **Animations**: [Framer Motion](https://framer.com/motion)
- **Components**: [Radix UI](https://www.radix-ui.com) & [Lucide Icons](https://lucide.dev)

## Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Supabase](https://supabase.com) account and database project.

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-supabase-key"
```

## Setup Instructions

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

3. **Database Migration** (if needed):

   ```bash
   npx prisma db push
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com):

1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Add your environment variables in the Vercel dashboard.
4. Vercel will automatically build and deploy your application.

## License

MIT
