import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch {
      toast.error("cannot redirect to the Dashbaord.")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Card className="w-full max-w-md shadow-xl border-0 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight text-black dark:text-white">Replicon</CardTitle>
          <CardDescription className="text-center text-zinc-600 dark:text-zinc-300 mt-1">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 placeholder-zinc-500 dark:placeholder-zinc-400 text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black/80 dark:focus:ring-white/80 transition"
                autoComplete="username"
              />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 placeholder-zinc-500 dark:placeholder-zinc-400 text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black/80 dark:focus:ring-white/80 transition"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            <CardFooter className="flex flex-col gap-2 items-center p-0 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2 text-base font-semibold text-white dark:text-black bg-black dark:bg-white rounded-lg shadow hover:bg-zinc-200 dark:hover:bg-zinc-700 transition disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;