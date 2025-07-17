import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth/server-auth';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Connexion - Agents Liminals',
  description: 'Connectez-vous à votre compte Agents Liminals',
};

export default async function LoginPage() {
  const { user } = await getServerAuth();

  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-300 mb-2 font-serif">
            🌌 Agents Liminals
          </h1>
          <p className="text-slate-400">
            Accédez à l'Observatoire des États Intérieurs
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Pas encore de compte ?{' '}
            <a href="/auth/register" className="text-blue-400 hover:text-blue-300 underline">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}