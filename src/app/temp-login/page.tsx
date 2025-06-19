'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TempLogin() {
  const [status, setStatus] = useState('');
  const router = useRouter();

  const createAdminAndLogin = async () => {
    try {
      setStatus('Creating admin user...');
      
      // First, try to create admin user directly
      const createResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          email: 'admin@test.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          systemRole: 'ADMIN'
        })
      });
      
      const createResult = await createResponse.json();
      setStatus('Admin created: ' + JSON.stringify(createResult));
      
      // Now try to login
      setStatus('Attempting login...');
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok) {
        setStatus('Login successful! Redirecting...');
        // Set a simple auth flag in localStorage
        localStorage.setItem('auth-user', JSON.stringify(loginResult.user));
        router.push('/dashboard');
      } else {
        setStatus('Login failed: ' + JSON.stringify(loginResult));
      }
      
    } catch (error) {
      setStatus('Error: ' + String(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Temporary Login Fix</h2>
        
        <button
          onClick={createAdminAndLogin}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Admin & Login
        </button>
        
        {status && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-sm whitespace-pre-wrap">{status}</pre>
          </div>
        )}
        
        <div className="text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to normal login
          </a>
        </div>
      </div>
    </div>
  );
}
