'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useChatHistoryStore } from '@/store/chatHistoryStore';
import { useChatStore } from '@/store/chatStore';
import { authClient } from '@/lib/authClient';
import { chatHistoryApi } from '@/lib/chatHistoryClient';
import { Button } from '@/components/ui/button';
import { FiMail, FiLock, FiUser, FiArrowRight, FiZap } from 'react-icons/fi';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function SignUpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setCurrentChatId, addChat } = useChatHistoryStore();
  const { clearMessages } = useChatStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authClient.signUp({ email, password, name });
      setAuth(response.user, response.access_token);
      
      // Auto-create new chat after signup
      try {
        const newChat = await chatHistoryApi.createChat(response.access_token, 'Welcome! 🎉');
        setCurrentChatId(newChat._id);
        addChat({
          _id: newChat._id,
          title: newChat.title,
          createdAt: newChat.createdAt,
          updatedAt: newChat.updatedAt,
        });
        clearMessages();
      } catch (chatError) {
        console.error('Failed to create default chat:', chatError);
      }
      
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.21, 1.02, 0.73, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-16 -left-16 text-6xl opacity-20"
        >
          🎉
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-16 -right-16 text-6xl opacity-20"
        >
          🌟
        </motion.div>

        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
            animate={{
              background: [
                'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                'linear-gradient(135deg, transparent, rgba(236, 72, 153, 0.3), transparent)',
                'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 relative z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="inline-block text-6xl mb-4"
            >
              ✨
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Join the Future
            </h1>
            <p className="text-gray-300">Create your account and start exploring AI</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg relative z-10"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative z-10"
            >
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-10"
                placeholder="John Doe"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-10"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-10"
                placeholder="••••••••"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative z-10"
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all relative z-10"
                placeholder="••••••••"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative z-10"
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center relative z-10"
          >
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-center relative z-10"
          >
            <p className="text-xs text-gray-500">
              Developed by <span className="text-purple-400 font-semibold">Fedi Hmida</span> ✨
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
