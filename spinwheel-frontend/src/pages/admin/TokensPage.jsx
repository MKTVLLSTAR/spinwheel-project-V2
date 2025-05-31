import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import CustomerPage from "./pages/CustomerPage";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import PrizesPage from "./pages/admin/PrizesPage";

// Components
import AdminLayout from "./components/AdminLayout";

// Lazy load other admin pages
const TokensPage = React.lazy(() => import("./pages/admin/TokensPage"));
const ResultsPage = React.lazy(() => import("./pages/admin/ResultsPage"));
const UsersPage = React.lazy(() => import("./pages/admin/UsersPage"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" data-theme="spinwheel">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CustomerPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="prizes" element={<PrizesPage />} />
              <Route
                path="tokens"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-64">
                        <div className="loading-spinner"></div>
                      </div>
                    }
                  >
                    <TokensPage />
                  </React.Suspense>
                }
              />
              <Route
                path="results"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-64">
                        <div className="loading-spinner"></div>
                      </div>
                    }
                  >
                    <ResultsPage />
                  </React.Suspense>
                }
              />
              <Route
                path="users"
                element={
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-64">
                        <div className="loading-spinner"></div>
                      </div>
                    }
                  >
                    <UsersPage />
                  </React.Suspense>
                }
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
