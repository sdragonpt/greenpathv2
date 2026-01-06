import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Bike,
  MapPin,
  Clock,
  Leaf,
  Battery,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useAuth } from "@/store/AuthContext";
import { useTheme } from "@/store/ThemeContext";
import { useAppState } from "@/store/AppStateContext";
import { formatDistance } from "@/lib/utils";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const appState = useAppState();
  const [showSettings, setShowSettings] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { stats, vehicle, battery } = appState;

  const handleLogout = () => {
    logout();
    navigate("/welcome");
  };

  const menuItems = [
    {
      icon: Bike,
      label: "O Meu Veículo",
      description: vehicle?.name || "Trotinete Elétrica",
      onClick: () => setShowVehicle(true),
    },
    {
      icon: Bell,
      label: "Notificações",
      description: "Gerir alertas e avisos",
      onClick: () => {},
    },
    {
      icon: Shield,
      label: "Privacidade",
      description: "Dados e permissões",
      onClick: () => {},
    },
    {
      icon: HelpCircle,
      label: "Ajuda e Suporte",
      description: "FAQ e contactos",
      onClick: () => {},
    },
    {
      icon: Settings,
      label: "Definições",
      description: "Preferências da app",
      onClick: () => setShowSettings(true),
    },
  ];

  const statsCards = [
    {
      icon: MapPin,
      label: "Total Percorrido",
      value: formatDistance(stats?.totalDistance || 0),
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Clock,
      label: "Viagens",
      value: `${stats?.totalTrips || 0}`,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: Leaf,
      label: "CO₂ Poupado",
      value: `${((stats?.totalDistance || 0) * 0.12).toFixed(1)} kg`,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Battery,
      label: "Energia Usada",
      value: `${((stats?.totalDistance || 0) * 0.015).toFixed(1)} kWh`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <TopBar showBack={false} title="Perfil" />

      <div className="flex-1 p-4">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="border-4 border-white/30">
                  <AvatarImage
                    src={user?.avatar ?? ""}
                    alt={user?.name ?? "Utilizador"}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-white">
                  <h2 className="text-xl font-bold">
                    {user?.name || "Utilizador"}
                  </h2>
                  <p className="text-sm opacity-80">
                    {user?.email || "email@exemplo.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalTrips || 0}
                </p>
                <p className="text-sm text-muted-foreground">Viagens</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatDistance(stats?.totalDistance || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Percorridos</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {statsCards.map((stat, index) => (
              <Card key={index} className="p-4">
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Opções
          </h3>
          <Card className="divide-y divide-gray-200 dark:divide-gray-700">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="h-4 w-4" />
            Terminar Sessão
          </Button>
        </motion.div>

        {/* App version */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          GreenPath v1.0.0 • Feito com 💚
        </p>
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <div className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Definições</h3>

          <div className="space-y-4">
            {/* Theme */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Tema
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-colors ${
                    theme === "light"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Claro</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-colors ${
                    theme === "dark"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Escuro</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-colors ${
                    theme === "system"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs">Sistema</span>
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sons</Label>
                <Switch id="sound" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration">Vibração</Label>
                <Switch id="vibration" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-alerts">Alertas meteorológicos</Label>
                <Switch id="weather-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="battery-alerts">Alertas de bateria</Label>
                <Switch id="battery-alerts" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Vehicle Sheet */}
      <Sheet open={showVehicle} onOpenChange={setShowVehicle}>
        <div className="p-4">
          <h3 className="mb-4 text-lg font-semibold">O Meu Veículo</h3>

          <Card className="mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 text-white">
              <Bike className="mb-2 h-12 w-12" />
              <h4 className="text-xl font-bold">
                {vehicle?.name || "Trotinete Elétrica"}
              </h4>
              <p className="text-sm opacity-80">
                {vehicle?.model || "GreenPath E-Scooter"}
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            <Card className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Autonomia máxima</span>
              <span className="font-semibold">
                {vehicle?.maxRange || 45} km
              </span>
            </Card>
            <Card className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Capacidade bateria</span>
              <span className="font-semibold">
                {vehicle?.batteryCapacity || 48} Wh
              </span>
            </Card>
            <Card className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Velocidade máxima</span>
              <span className="font-semibold">
                {vehicle?.maxSpeed || 25} km/h
              </span>
            </Card>
            <Card className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Bateria atual</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {battery.percentage}%
              </span>
            </Card>
            <Card className="flex items-center justify-between p-4">
              <span className="text-muted-foreground">Saúde da bateria</span>
              <span className="font-semibold">{battery.health || 98}%</span>
            </Card>
          </div>
        </div>
      </Sheet>

      {/* Logout Confirmation Sheet */}
      <Sheet open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <div className="p-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <LogOut className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Terminar sessão?</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Tens a certeza que queres sair da tua conta?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </Sheet>

      <BottomNav />
    </div>
  );
}
