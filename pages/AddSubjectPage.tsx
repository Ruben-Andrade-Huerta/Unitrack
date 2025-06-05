
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import { ROUTE_PATHS } from '../constants';

const AddSubjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { addSubject } = useContext(DataContext) as DataContextType;
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && codigo.trim()) {
      addSubject({ nombre, codigo });
      navigate(ROUTE_PATHS.SUBJECTS_LIST);
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title="Agregar Nueva Materia" showCloseButton={true} closePath={ROUTE_PATHS.SUBJECTS_LIST} />
      <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-6 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <label htmlFor="materiaName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Materia
            </label>
            <input
              type="text"
              id="materiaName"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Cálculo Integral"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="materiaCode" className="block text-sm font-medium text-gray-700 mb-1">
              Código de la Materia
            </label>
            <input
              type="text"
              id="materiaCode"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. MAT201"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.SUBJECTS_LIST)}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Guardar Materia
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubjectPage;
    