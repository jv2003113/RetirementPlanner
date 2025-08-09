import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PiggyBank, TrendingUp, Shield, Target } from 'lucide-react';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Subtle background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-yellow-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 shadow-lg">
              <PiggyBank className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">EasyRetire</h1>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Your path to financial freedom starts here
          </p>
          <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Smart Planning</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-yellow-600" />
              <span>Goal-Driven</span>
            </div>
          </div>
        </div>
        
        {/* Auth Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
            <div className="bg-gray-50 px-6 pt-6 pb-2">
              <TabsList className="grid w-full grid-cols-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <TabsTrigger 
                  value="login" 
                  className="rounded-md font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Welcome Back
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-md font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Get Started
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
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
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Trusted by thousands to plan their retirement journey</p>
        </div>
      </div>
    </div>
  );
}
