'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-16">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Eventure
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Event Mapping Made Simple
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-gray-900 mb-8">
          Sign in to your account
        </h2>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
