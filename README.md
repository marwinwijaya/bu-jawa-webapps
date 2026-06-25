# Rumah Makan Bu Jawa - Web App

Website modern untuk Rumah Makan Bu Jawa menggunakan React, Vite, TypeScript, Tailwind CSS, dan Firebase.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Routing**: React Router (HashRouter for GitHub Pages)
- **Database**: Firebase Firestore
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Firebase project (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/bu-jawa-webapps.git
cd bu-jawa-webapps
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Go to Project Settings > General > Your apps
   - Copy the config values to your `.env` file

5. Start development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_RESTAURANT_WHATSAPP` | WhatsApp number (with country code) |
| `VITE_ADMIN_EMAILS` | Comma-separated admin emails |

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set Firestore security rules (see below)
4. Run the seed script to populate initial data:
```bash
npm run seed
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for menu and gallery
    match /menu_categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email in ['admin@example.com'];
    }
    
    match /menu_items/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email in ['admin@example.com'];
    }
    
    match /gallery/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email in ['admin@example.com'];
    }
  }
}
```

## Deployment to GitHub Pages

1. Build the project:
```bash
npm run build
```

2. Deploy to GitHub Pages:
   - Go to repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: `main` / `gh-pages` (or use GitHub Actions)
   - Folder: `/ (root)` or `/docs`

3. For automatic deployment, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run seed` | Seed Firestore with initial data |
| `npm run test` | Run tests |
| `npm run lint` | Run linter |

## Project Structure

```
bu-jawa-webapps/
├── public/              # Static assets
├── src/
│   ├── data/           # Seed data and constants
│   │   └── seed.ts     # Firestore seed script
│   ├── App.tsx         # Main app component with HashRouter
│   ├── main.tsx        # Entry point
│   └── index.css       # Tailwind directives and custom theme
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## License

MIT License - see [LICENSE](LICENSE) file
