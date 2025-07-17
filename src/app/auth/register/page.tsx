import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/auth/server-auth';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Inscription - Agents Liminals',
  description: 'Créez votre compte Agents Liminals',
};

export default async function RegisterPage() {
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
            Rejoignez l'Observatoire des États Intérieurs
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Déjà un compte ?{' '}
            <a href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}