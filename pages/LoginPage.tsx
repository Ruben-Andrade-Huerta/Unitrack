import React, { useState, useContext } from 'react';
import { DataContext, DataContextType } from '../contexts/DataContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(DataContext) as DataContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginPage: email:', email, 'password:', password);
    if (email && password) {
      // Llamar a la API de login
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // Cambia 'username' por 'email'
      });
      if (res.ok) {
        const data = await res.json();
        // Guardar el token en localStorage
        localStorage.setItem('accessToken', data.access || data.token);
        login();
      } else {
        let errorMsg = 'Credenciales incorrectas.';
        try {
          const errorData = await res.json();
          if (errorData && errorData.detail) {
            errorMsg = errorData.detail;
          } else if (typeof errorData === 'string') {
            errorMsg = errorData;
          }
        } catch (e) {}
        alert(errorMsg);
      }
    } else {
      alert('Por favor, ingrese correo y contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">UniTrack</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico/ID Universitario
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@universidad.edu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out mb-4"
          >
            Iniciar Sesión
          </button>
          <div className="text-center">
            <a href="#/forgot-password" className="text-sm text-blue-600 hover:underline">
              ¿Olvidó su contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
