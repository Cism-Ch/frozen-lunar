# 🚚 Frozen Lunar

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

> **Development Phase 1: UI Implementation** 🎨  
> This is currently in the UI implementation phase before Phase 2: Backend integration

A modern, professional web platform for specialized logistics and transportation services. Built with Next.js 16, React 19, and TypeScript, focusing on construction materials, containers, and heavy machinery transport.

## 📋 Table of Contents

- [Overview](#overview)
- [Development Status](#development-status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Frozen Lunar** (Code Name) is a comprehensive digital platform designed for a specialized logistics company with over 15 years of experience. The platform facilitates:

- **Transport de Matériaux** - Fast delivery of construction materials to job sites
- **Transport de Containers** - Specialized container shipping solutions
- **Transport de Charpentes** - Handling of wood and metal frameworks
- **Transport de Machines** - Secure transport of industrial machinery
- **Modules Préfabriqués** - Complete logistics for prefabricated modules

### Mission

"Votre sécurité Notre priorité" - Your safety is our priority. Providing reliable, secure, and professional transport services with a modern digital experience.

## 🚧 Development Status

### Phase 1: UI Implementation (Current)

This repository contains the complete **frontend UI implementation** built with modern web technologies. All user interfaces, animations, and client-side interactions are fully functional.

**Completed Features:**
- ✅ Responsive landing page with hero section
- ✅ Service showcase and features
- ✅ Quote request wizard with multi-step form
- ✅ Admin dashboard interface
- ✅ Contact management system UI
- ✅ Quote management interface
- ✅ Settings and configuration panels
- ✅ Dark/Light theme support
- ✅ Mobile-responsive design
- ✅ Smooth animations and transitions

**Current Limitations:**
- ⚠️ Backend API integration pending
- ⚠️ Database connectivity pending
- ⚠️ Authentication system pending
- ⚠️ Real-time data processing pending

### Phase 2: Backend Integration (Planned)

The next phase will focus on:
- 🔄 RESTful API development
- 🔄 Database schema and implementation
- 🔄 User authentication and authorization
- 🔄 Quote processing and management backend
- 🔄 Email notification system
- 🔄 Payment gateway integration
- 🔄 Real-time tracking system

## ✨ Features

### Public Features
- **Modern Landing Page** - Eye-catching hero section with animations
- **Service Catalog** - Detailed presentation of all transport services
- **Interactive Quote Wizard** - Multi-step form for quote requests with validation
- **Contact Forms** - Easy communication channels
- **Responsive Design** - Optimized for all devices
- **Theme Switcher** - Dark/Light mode support
- **WhatsApp Integration** - Direct messaging capability
- **FAQ Section** - Common questions and answers
- **Testimonials** - Customer reviews and ratings

### Admin Panel (UI)
- **Dashboard** - Overview of business metrics and KPIs
- **Quote Management** - Review and process quote requests
- **Contact Management** - Client and team member profiles
- **Settings** - System configuration and preferences
- **Timeline View** - Quote status tracking
- **Export Functionality** - PDF generation for quotes

### UI Components
- Custom form components with validation
- Date pickers and selectors
- Modal dialogs and sheets
- Accordion and tabs
- Toast notifications
- Avatar components
- Badge and status indicators
- Animated transitions (Framer Motion)

## 🛠 Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Form validators

### Utilities
- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[class-variance-authority](https://cva.style/)** - CSS utility organization

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cism-Ch/frozen-lunar.git
   cd frozen-lunar
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env.local` file in the root directory (if needed for Phase 2):

```env
# Add environment variables here when backend is implemented
# NEXT_PUBLIC_API_URL=
# DATABASE_URL=
# NEXTAUTH_SECRET=
```

## 📁 Project Structure

```
frozen-lunar/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── contacts/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── quotes/
│   │   │   └── settings/
│   │   ├── about/      # About page
│   │   ├── contact/    # Contact page
│   │   ├── devis/      # Quote request page
│   │   ├── legal/      # Legal pages
│   │   ├── services/   # Services page
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Homepage
│   │   └── globals.css # Global styles
│   ├── components/     # React components
│   │   ├── features/   # Feature-specific components
│   │   │   ├── quote-wizard/
│   │   │   └── support/
│   │   ├── layout/     # Layout components
│   │   └── ui/         # Reusable UI components
│   ├── config/         # Configuration files
│   │   └── marketing.ts
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript types
├── components.json     # Shadcn UI config
├── next.config.ts      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS config
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on [localhost:3000](http://localhost:3000) |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

## 🗺 Roadmap

### Phase 1: UI Implementation ✅ (Current)
- [x] Landing page design and implementation
- [x] Service pages and features
- [x] Quote request wizard
- [x] Admin dashboard UI
- [x] Contact management interface
- [x] Responsive design for all devices
- [x] Theme support (Dark/Light)
- [x] Animation and transitions

### Phase 2: Backend Development 🔄 (Next)
- [ ] Backend API architecture
- [ ] Database design and setup
- [ ] Authentication system (NextAuth.js)
- [ ] Quote management backend
- [ ] Email notification service
- [ ] File upload and storage
- [ ] Payment processing integration
- [ ] Admin role-based access control

### Phase 3: Production Ready 🎯 (Future)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Monitoring and logging
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Documentation
- [ ] Production deployment

## 🤝 Contributing

This is a private project. For team members:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use existing component patterns
- Maintain responsive design principles
- Write meaningful commit messages
- Test on multiple devices/browsers

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Contact

**HBC SERVICE CASH LOGISTIQUE IMMOBILIÈRE**

- Website: [http://localhost:3000](http://localhost:3000) (Development)
- Email: [Contact via website form]
- WhatsApp: [Available on website]

---

<div align="center">
  <p><strong>Built with ❤️ using Next.js, React, and TypeScript</strong></p>
  <p><em>Phase 1: UI Implementation Complete | Phase 2: Backend Integration Coming Soon</em></p>
</div>
