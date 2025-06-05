
import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import { ROUTE_PATHS } from '../constants';

const AddStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { grupoId } = useParams<{ grupoId: string }>();
  const { addStudentToGroup, getGroupById } = useContext(DataContext) as DataContextType;
  
  const [nombre, setNombre] = useState('');
  const [studentId, setStudentId] = useState(''); // Matricula

  const groupDetails = grupoId ? getGroupById(grupoId) : null;
  const groupName = groupDetails?.group?.nombre || '';
  const subjectName = groupDetails?.subject?.nombre || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && studentId.trim() && grupoId) {
      addStudentToGroup(grupoId, { nombre, studentId });
      navigate(ROUTE_PATHS.MANAGE_STUDENTS.replace(':grupoId', grupoId));
    } else {
      alert('Por favor, completa todos los campos.');
    }
  };

  const pageTitle = `Nuevo Estudiante para ${groupName} (${subjectName})`;

  if (!grupoId || !groupDetails) {
    return (
      <div>
        <PageHeader title="Agregar Estudiante" showCloseButton={true} />
        <p className="p-4 text-center text-gray-500">Grupo no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader title={pageTitle} showCloseButton={true} closePath={ROUTE_PATHS.MANAGE_STUDENTS.replace(':grupoId', grupoId)} />
      <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-6 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo del Estudiante
            </label>
            <input
              type="text"
              id="studentName"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez García"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="studentMatricula" className="block text-sm font-medium text-gray-700 mb-1">
              Matrícula / ID del Estudiante
            </label>
            <input
              type="text"
              id="studentMatricula"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ej. A01234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              required
            />
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATHS.MANAGE_STUDENTS.replace(':grupoId', grupoId))}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            Agregar Estudiante
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;
    