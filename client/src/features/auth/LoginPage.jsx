import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from './authApi';
import { setCredentials } from './authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.data.user, token: result.data.token }));
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600">TaskFlow</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Sign in to your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </form>

        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
          <p className="text-sm text-gray-600">Email: alice@taskflow.demo</p>
          <p className="text-sm text-gray-600">Password: Demo@1234</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
