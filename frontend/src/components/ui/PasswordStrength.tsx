'use client';

import { useMemo } from 'react';

interface Props {
  password: string;
}

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
const textColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];

export default function PasswordStrength({ password }: Props) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? colors[strength - 1] : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${textColors[strength - 1] || 'text-gray-500'}`}>
        {strength > 0 ? labels[strength - 1] : 'Enter a password'}
      </p>
    </div>
  );
}
