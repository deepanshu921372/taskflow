import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from './authApi';
import { setCredentials } from './authSlice';
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
    } catch (err) {
      toast.error(err.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">TF</span>
            </div>
            <span className="text-2xl font-semibold text-gray-800">TaskFlow</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to continue to your boards</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Demo account</p>
            <p className="text-sm text-gray-600">alice@taskflow.demo</p>
            <p className="text-sm text-gray-600">Demo@1234</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary-600 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Organize your work
          </h2>
          <p className="text-primary-100">
            Create boards, manage tasks, and collaborate with your team in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
