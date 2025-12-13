import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Shield, Target } from 'lucide-react';
import { ERLogo } from '@/components/ui/ERLogo';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - App Preview */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-12 flex-col justify-between">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-100 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-200">
              <ERLogo className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Retire Easy</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            Visualize Your<br />Financial Future
          </h2>

          <p className="text-gray-600 text-base leading-relaxed max-w-md mb-8">
            Plan your retirement with confidence using our comprehensive tools and interactive visualizations.
          </p>

          {/* App Preview - Mock Dashboard */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs text-gray-400 font-medium">Retirement Dashboard</span>
            </div>

            {/* Mock content */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="w-16 h-3 bg-blue-300 rounded mb-2"></div>
                  <div className="w-12 h-5 bg-blue-600 rounded"></div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                  <div className="w-16 h-3 bg-emerald-300 rounded mb-2"></div>
                  <div className="w-12 h-5 bg-emerald-600 rounded"></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-24 h-3 bg-gray-300 rounded"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="h-24 bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around px-2 pb-2">
                  <div className="w-8 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                  <div className="w-8 bg-blue-400 rounded-t" style={{ height: '80%' }}></div>
                  <div className="w-8 bg-blue-500 rounded-t" style={{ height: '70%' }}></div>
                  <div className="w-8 bg-blue-600 rounded-t" style={{ height: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        {/* Features */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-200">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-900 font-medium text-sm">Secure</span>
            </div>
            <p className="text-gray-500 text-xs">Bank-level encryption</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-200">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-gray-900 font-medium text-sm">Smart</span>
            </div>
            <p className="text-gray-500 text-xs">AI-powered projections</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-white rounded-lg p-1.5 shadow-sm border border-gray-200">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-gray-900 font-medium text-sm">Tracking</span>
            </div>
            <p className="text-gray-500 text-xs">Monitor your progress</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div>
                <ERLogo className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Retire Easy</h1>
            </div>
            <p className="text-gray-600 text-sm">Visualize Your Financial Future</p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
              <div className="bg-gray-50 px-6 pt-6 pb-2 border-b border-gray-100">
                <TabsList className="grid w-full grid-cols-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <TabsTrigger
                    value="login"
                    className="rounded-md font-medium text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-md font-medium text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6 sm:p-8">
                <TabsContent value="login" className="mt-0">
                  <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm mb-2">Your partner for simple, stress-free planning</p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Smart
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Reliable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
