import { Providers } from "./providers";
import AuthLoader from "./auth-loader";
import { ToastContainer } from "react-toastify";
import "@app/index.css";
import NextTopLoader from "nextjs-toploader";
import ErrorBoundary from "@app/components/ErrorBoundary";

export const metadata = {
  title: {
    template: "%s | Jan Umang - Advanced RBAC Admin Portal",
    default: "Jan Umang - Advanced RBAC Admin Portal",
  },
  description:
    "A highly optimized, feature-rich admin dashboard built with React, Next.js, and Jan Umang. Featuring advanced RBAC, performance-tuned charts, and multi-theme support.",
  keywords: [
    "Jan Umang",
    "React",
    "Next.js",
    "RBAC",
    "Dashboard",
    "Admin Portal",
    "Tailwind CSS",
  ],
  authors: [{ name: "Deepmind Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="antialiased sidebar-mini layout-fixed layout-navbar-fixed layout-footer-fixed">
        <NextTopLoader color="#368F8B" showSpinner={false} />
        <ErrorBoundary>
          <Providers>
            <AuthLoader>
              {children}
              <ToastContainer
                autoClose={3000}
                draggable={false}
                position="top-right"
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnHover
              />
            </AuthLoader>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
