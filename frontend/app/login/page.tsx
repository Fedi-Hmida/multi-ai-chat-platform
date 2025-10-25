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
import { FiMail, FiLock, FiArrowRight, FiZap } from 'react-icons/fi';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function SignInPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setCurrentChatId, addChat } = useChatHistoryStore();
  const { clearMessages } = useChatStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authClient.signIn({ email, password });
      setAuth(response.user, response.access_token);
      
      // Auto-create new chat after login
      try {
        const newChat = await chatHistoryApi.createChat(response.access_token, 'New Chat');
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
      setError(err instanceof Error ? err.message : 'Sign in failed');
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
        transition={{ duration: 0.6, ease: [0.21, 1.02, 0.73, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-16 -left-16 text-6xl opacity-20"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-16 -right-16 text-6xl opacity-20"
        >
          ✨
        </motion.div>

        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-50"
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
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="inline-block text-6xl mb-4"
            >
              🤖
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-300">Sign in to continue your AI journey</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 rounded-xl backdrop-blur-xl relative z-10"
            >
              <p className="text-red-200 text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <FiMail className="w-5 h-5" />
                </motion.div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/10 transition-all duration-300 backdrop-blur-xl"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <motion.div
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  whileHover={{ scale: 1.2, rotate: -10 }}
                >
                  <FiLock className="w-5 h-5" />
                </motion.div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/10 transition-all duration-300 backdrop-blur-xl"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all duration-300 disabled:opacity-50 group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <FiZap className="w-5 h-5" />
                      </motion.div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center relative z-10"
          >
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text hover:from-purple-300 hover:to-pink-300 font-semibold transition-all duration-300"
              >
                Sign Up →
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
