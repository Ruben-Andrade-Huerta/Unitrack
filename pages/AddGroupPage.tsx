
import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import { ROUTE_PATHS } from '../constants';

const AddGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { materiaId } = useParams<{ materiaId: string }>();
  const { addGroup, getSubjectById } = useContext(DataContext) as DataContextType;
  const [nombre, setNombre] = useState('');

  const subject = materiaId ? getSubjectById(materiaId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && materiaId) {
      addGroup(materiaId, { nombre });
      navigate(ROUTE_PATHS.SUBJECT_DETAILS.replace(':materiaId', materiaId));
    } else {
      alert('Por favor, ingresa un nombre para el grupo.');
    }
  };

  if (!subject) {
     return (
      <div>
        <PageHeader title="Materia no encontrada" showCloseButton={true} closePath={ROUTE_PATHS.SUBJECTS_LIST} />
        <p className="p-4 text-center text-gray-500">No se pudo encontrar la materia para agregar el grupo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title={`Nuevo Grupo para ${subject.nombre}`} showCloseButton={true} closePath={ROUTE_PATHS.SUBJECT_DETAILS.replace(':materiaId', subject.id)} />
      <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-6 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Grupo
            </label>
            <input
              type="text"
              id="groupName"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Grupo A, Matutino"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.SUBJECT_DETAILS.replace(':materiaId', subject.id))}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Guardar Grupo
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGroupPage;
    