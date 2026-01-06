import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/AuthContext';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Fraca', color: 'bg-red-500' };
  if (score === 2) return { score, label: 'Razoável', color: 'bg-yellow-500' };
  if (score === 3) return { score, label: 'Boa', color: 'bg-green-400' };
  return { score, label: 'Forte', color: 'bg-green-600' };
}

export function SignupScreen() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Por favor preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Por favor insira um email válido');
      return;
    }

    if (password.length < 8) {
      setFormError('A password deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('As passwords não coincidem');
      return;
    }

    if (!acceptedTerms) {
      setFormError('Por favor aceite os termos e condições');
      return;
    }

    try {
      await signup({ name, email, password, confirmPassword });
      navigate(ROUTES.HOME);
    } catch (err) {
      setFormError('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-inset">
      {/* Header */}
      <div className="px-4 pt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">
            Criar Conta
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Junte-se à mobilidade sustentável
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="O seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="h-4 w-4" />}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  autoComplete="new-password"
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme a sua password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  autoComplete="new-password"
                  className={cn(
                    'pr-12',
                    confirmPassword && (passwordsMatch ? 'border-green-500' : 'border-red-500')
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">As passwords não coincidem</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords coincidem
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className={cn(
                  'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                  acceptedTerms
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground'
                )}
              >
                {acceptedTerms && <Check className="h-3 w-3" />}
              </button>
              <p className="text-sm text-muted-foreground">
                Aceito os{' '}
                <button type="button" className="text-primary hover:underline">
                  Termos de Serviço
                </button>{' '}
                e a{' '}
                <button type="button" className="text-primary hover:underline">
                  Política de Privacidade
                </button>
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <motion.p
                className="text-sm text-red-500 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formError}
              </motion.p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full mt-6"
              disabled={isLoading || !acceptedTerms}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{' '}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-primary font-medium hover:underline"
            >
              Iniciar sessão
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
