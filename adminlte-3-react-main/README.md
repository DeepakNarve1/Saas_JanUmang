# AdminLTE React - Modern Admin Dashboard

A comprehensive, production-ready admin dashboard built with Next.js, TypeScript, React Query, and Tailwind CSS.

## 🚀 Features

- ✅ **Modern Tech Stack**: Next.js 14, React 18, TypeScript, React Query
- ✅ **Authentication & Authorization**: JWT-based auth with RBAC (Role-Based Access Control)
- ✅ **34+ Modules**: Complete admin panel with users, roles, permissions, activity logs, and more
- ✅ **Data Management**: Advanced filtering, pagination, sorting, and Excel export
- ✅ **Activity Tracking**: Comprehensive audit trail with user activity reports
- ✅ **Responsive Design**: Mobile-friendly UI with Tailwind CSS + shadcn/ui
- ✅ **Internationalization**: Multi-language support (i18n)
- ✅ **Performance Optimized**: React Query caching, SWC minification, image optimization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher (check with `node --version`)
- **npm**: v9.x or higher (check with `npm --version`)
- **Git**: Latest version

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd adminlte-3-react-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Configuration
API_BASE_URL=http://localhost:5000/api
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## 📦 Available Scripts

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `npm run dev`    | Start development server on port 3001 |
| `npm run build`  | Build production bundle               |
| `npm start`      | Start production server               |
| `npm run lint`   | Run ESLint for code quality           |
| `npm run format` | Format code with Prettier             |

## 🏗️ Project Structure

```
adminlte-3-react-main/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   ├── usePermissions.ts
│   │   ├── useAuthorization.ts
│   │   └── useDebounce.ts
│   ├── store/              # Redux store configuration
│   │   └── reducers/       # Redux slices
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   │   ├── axios.ts        # Axios instance with interceptors
│   │   └── helpers.ts
│   └── views/              # Feature modules (34+ modules)
│       ├── users/
│       ├── roles/
│       ├── permissions/
│       ├── activityManagement/
│       └── ...
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
├── next.config.mjs        # Next.js configuration
├── tailwind.config.cjs    # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔑 Key Technologies

### Core

- **Next.js 14.2.3** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.4.5** - Type safety

### State Management

- **Redux Toolkit 2.2.5** - Global state management
- **React Query 5.90** - Server state management & caching

### UI & Styling

- **Tailwind CSS 4.1** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Forms & Validation

- **Formik 2.4.6** - Form management
- **Yup 1.4.0** - Schema validation
- **Zod 4.3.5** - TypeScript-first validation

### Data & API

- **Axios 1.13.2** - HTTP client
- **React Query** - Data fetching & caching

### Additional Features

- **FullCalendar** - Calendar & events
- **Chart.js** - Data visualization
- **XLSX** - Excel export
- **i18next** - Internationalization

## 🔐 Authentication & Authorization

### Authentication Flow

1. User logs in with credentials
2. Backend returns JWT token
3. Token stored in localStorage
4. Axios interceptor attaches token to all requests
5. Auto-logout on 401 (unauthorized)

### Role-Based Access Control (RBAC)

```typescript
import { usePermissions } from '@app/hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission } = usePermissions();

  if (!hasPermission('view_users')) {
    return <div>Access Denied</div>;
  }

  return <div>User List</div>;
};
```

### Available Permission Hooks

- `hasPermission(permissionName)` - Check single permission
- `hasAnyPermission([...permissions])` - Check if user has any of the permissions
- `hasAllPermissions([...permissions])` - Check if user has all permissions
- `hasSidebarAccess(path)` - Check sidebar menu access

## 📊 Module Overview

### Core Modules

- **Users Management** - CRUD operations for users
- **Roles Management** - Define and manage roles
- **Permissions Management** - Granular permission control
- **Activity Logs** - Comprehensive audit trail
- **User Activity Report** - Detailed activity analytics

### Administrative Modules

- **Department Management**
- **Division Management**
- **District Management**
- **Block Management**
- **Village Management**
- **Booth Management**

### Political Modules

- **Parliament Management**
- **Vidhan Sabha Management**
- **Assembly Management**
- **Party Management**
- **Samiti Management**

### Document Management

- **Inward Register**
- **Dispatch Register**
- **Phone Directory**
- **Visitor Management**

### Additional Features

- **Events Calendar**
- **Call Management**
- **Member List**
- **Voter Management**
- **Work Type Management**

## 🎨 UI Components

Built with **shadcn/ui** for consistent, accessible components:

- Tables with sorting, filtering, pagination
- Forms with validation
- Modals & dialogs
- Dropdowns & selects
- Buttons & inputs
- Cards & layouts
- Toast notifications

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable               | Description            | Required |
| ---------------------- | ---------------------- | -------- |
| `API_BASE_URL`         | Backend API URL        | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID | No       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret    | No       |

### Next.js Configuration

Key optimizations in `next.config.mjs`:

- SWC minification for faster builds
- Image optimization (AVIF, WebP)
- CSS optimization
- Console removal in production
- Gzip compression

## 🐛 Troubleshooting

### Common Issues

**Port 3001 already in use**

```bash
# Kill process on port 3001
npx kill-port 3001
# Or use different port
npm run dev -- -p 3002
```

**Module not found errors**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build errors**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📝 Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Pre-commit Hooks

Husky is configured to run linting before commits.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

- Create an issue in the repository
- Contact the development team

## 🎯 Roadmap

- [ ] Add comprehensive test suite (Jest + React Testing Library)
- [ ] Implement E2E testing (Playwright)
- [ ] Add Storybook for component documentation
- [ ] Enhance accessibility (WCAG 2.1 AA compliance)
- [ ] Add Docker support
- [ ] Implement CI/CD pipeline

---

**Built with ❤️ using Next.js, TypeScript, and React Query**
