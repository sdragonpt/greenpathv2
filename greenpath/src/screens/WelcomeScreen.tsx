import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Zap, MapPin, Battery, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function WelcomeScreen() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Rotas Inteligentes",
      description: "Otimizadas para a sua mota",
    },
    {
      icon: Battery,
      title: "Gestão de Bateria",
      description: "Maximize a sua autonomia",
    },
    {
      icon: Zap,
      title: "Pontos de Carga",
      description: "Encontre estações próximas",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Hero Section */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-5 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-8">
          {/* Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" />
              <motion.div
                className="absolute -right-1 -bottom-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <Zap className="w-4 h-4 text-yellow-900" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl font-bold text-foreground mb-2 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Bem-vindo ao GreenPath
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-center max-w-xs mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            A sua aplicação de mobilidade elétrica sustentável
          </motion.p>

          {/* Illustration / Features */}
          <motion.div
            className="w-full max-w-sm space-y-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        className="px-6 pb-8 space-y-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          size="xl"
          className="w-full"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Começar
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-primary font-medium hover:underline"
          >
            Iniciar sessão
          </button>
        </p>
      </motion.div>
    </div>
  );
}
