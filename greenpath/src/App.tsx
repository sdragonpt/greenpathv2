import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/store/ThemeContext";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { AppStateProvider } from "@/store/AppStateContext";
import { SplashScreen } from "@/screens/SplashScreen";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { RoutePlanningScreen } from "@/screens/RoutePlanningScreen";
import { NavigationScreen } from "@/screens/NavigationScreen";
import { ChargingStationsScreen } from "@/screens/ChargingStationsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import "@/styles/globals.css";

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}

function SplashRoute() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <SplashScreen
      onComplete={() => {
        navigate(isAuthenticated ? "/home" : "/welcome", { replace: true });
      }}
    />
  );
}

// Public route wrapper (redirect to home if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Initial screens */}
        <Route path="/" element={<SplashRoute />} />
        <Route
          path="/welcome"
          element={
            <PublicRoute>
              <WelcomeScreen />
            </PublicRoute>
          }
        />

        {/* Auth screens */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginScreen />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupScreen />
            </PublicRoute>
          }
        />

        {/* Protected screens */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/route"
          element={
            <ProtectedRoute>
              <RoutePlanningScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/navigation"
          element={
            <ProtectedRoute>
              <NavigationScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/charging"
          element={
            <ProtectedRoute>
              <ChargingStationsScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppStateProvider>
            <div className="app-shell">
              <AppRoutes />
            </div>
          </AppStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
