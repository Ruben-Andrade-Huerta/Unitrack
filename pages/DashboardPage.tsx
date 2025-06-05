import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import BottomButton from '../components/BottomButton';
import { Cog6ToothIcon, BookOpenIcon, ClockIcon, PlusIcon } from '../components/icons';
import { ROUTE_PATHS } from '../constants';
import { Subject, TodayClass } from '../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, todayClasses, logout } = useContext(DataContext) as DataContextType;

  const handleSettings = () => {
    // For now, logout on settings click
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  const handleTakeAttendance = (todayClass: TodayClass) => {
    navigate(ROUTE_PATHS.TAKE_ATTENDANCE.replace(':grupoId', todayClass.groupId).replace(':subjectId?', todayClass.subjectId));
  };

  return (
    <div className="pb-20"> {/* Padding for bottom button */}
      <PageHeader 
        title="UniTrack" 
        rightContent={
          <button onClick={handleSettings} title="Configuración" className="text-gray-600 hover:text-blue-600">
            <Cog6ToothIcon className="w-7 h-7" />
          </button>
        }
      />
      <div className="p-4 space-y-6">
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-semibold text-gray-800">Mis Materias</h2>
            <button 
              onClick={() => navigate(ROUTE_PATHS.SUBJECTS_LIST)} 
              className="text-sm text-blue-600 hover:underline">
              Ver todas
            </button>
          </div>
          {subjects.slice(0, 3).map((subject: Subject) => (
            <div key={subject.id} onClick={() => navigate(ROUTE_PATHS.SUBJECT_DETAILS.replace(':materiaId', subject.id))} className="bg-gray-100 p-4 rounded-lg mb-3 shadow-sm cursor-pointer hover:bg-gray-200 transition">
              <div className="flex items-center">
                <div className="bg-gray-200 p-3 rounded-lg mr-4">
                  <BookOpenIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{subject.nombre}</h3>
                  <p className="text-sm text-gray-500">
                    {subject.grupos.length > 0 ? subject.grupos.map(g => g.nombre).join(', ') : 'Sin grupos'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {subjects.length === 0 && <p className="text-gray-500">No hay materias agregadas.</p>}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Clases de Hoy</h2>
          {todayClasses.length > 0 ? todayClasses.map((tClass: TodayClass) => (
            <div key={`${tClass.subjectId}-${tClass.groupId}`} onClick={() => handleTakeAttendance(tClass)} className="bg-gray-100 p-4 rounded-lg mb-3 shadow-sm cursor-pointer hover:bg-gray-200 transition">
              <div className="flex items-center">
                <div className="bg-gray-200 p-3 rounded-lg mr-4">
                  <ClockIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">{tClass.subjectName}</h3>
                  <p className="text-sm text-gray-500">{tClass.groupName} &bull; {tClass.time}</p>
                </div>
              </div>
            </div>
          )) : <p className="text-gray-500">No hay clases programadas para hoy.</p>}
        </section>
      </div>
      <BottomButton text="Agregar Nueva Materia" icon={<PlusIcon className="w-5 h-5"/>} onClick={() => navigate(ROUTE_PATHS.ADD_SUBJECT)} />
    </div>
  );
};

export default DashboardPage;
