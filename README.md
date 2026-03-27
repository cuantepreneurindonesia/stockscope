# Stockscope 

The High-Precision Terminal for Indonesian Equity Markets.

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TailwindCSS 4
- MongoDB
- NextAuth
- next-intl (i18n)

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation
```bash
git clone https://github.com/cuantepreneurindonesia/stockscope.git
cd stockscope
npm install
cp .env.example .env.local
# Fill in .env.local values
npm run dev
```

## Project Structure
```text
src/
├── app/          # Pages and API routes
├── components/   # React components (ui, features, layout)
├── hooks/        # Custom React hooks
├── lib/          # Utilities, services, and configs
├── types/        # TypeScript types
└── styles/       # Global styles
```

## Available Scripts
| Command | Description |
|---------|-------------|
| npm run dev | Start dev server |
| npm run build | Build for production |
| npm run lint | Run ESLint |
| npm run type-check | Run TypeScript check |

## Environment Variables
See `.env.example` for all required variables.

## Contributing
1. Create feature branch from `main`
2. Make changes
3. Open PR with description of changes
