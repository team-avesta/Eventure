import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authState = authService.login({ username, password });

      if (!authState) {
        setError('Invalid username or password');
        return;
      }

      router.push('/screenshots');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Input
        id="username"
        name="username"
        type="text"
        label="Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button type="submit" fullWidth isLoading={isLoading}>
        Sign in
      </Button>
    </form>
  );
}
