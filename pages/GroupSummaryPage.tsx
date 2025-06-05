
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import BottomButton from '../components/BottomButton';
import ListItem from '../components/ListItem';
import { UsersIcon, PlusIcon } from '../components/icons';
import { ROUTE_PATHS } from '../constants';
import { Group, Subject as SubjectType, ClassSession, AttendanceStatus } from '../types'; // Renamed Subject to SubjectType to avoid conflict

const GroupSummaryPage: React.FC = () => {
  const { grupoId } = useParams<{ grupoId: string }>();
  const navigate = useNavigate();
  const { getGroupById } = useContext(DataContext) as DataContextType;
  const [groupData, setGroupData] = useState<{ subject?: SubjectType, group?: Group } | null>(null);

  useEffect(() => {
    if (grupoId) {
      const foundGroupData = getGroupById(grupoId);
      setGroupData(foundGroupData || null);
    }
  }, [grupoId, getGroupById]);

  if (!groupData || !groupData.group || !groupData.subject) {
    return (
      <div>
        <PageHeader title="Grupo no encontrado" showBackButton={true} />
        <p className="p-4 text-center text-gray-500">El grupo que buscas no existe o no se pudo cargar.</p>
      </div>
    );
  }

  const { subject, group } = groupData;

  const totalStudents = group.estudiantes.length;
  const totalSessions = group.sesiones.length;
  
  let totalPresent = 0;
  let totalPossibleAttendances = 0;

  group.sesiones.forEach(sesion => {
    sesion.asistencias.forEach(asistencia => {
      if (asistencia.status === AttendanceStatus.Presente || asistencia.status === AttendanceStatus.Tarde) {
        totalPresent++;
      }
    });
    totalPossibleAttendances += totalStudents;
  });

  const overallAttendancePercentage = totalPossibleAttendances > 0 ? Math.round((totalPresent / totalPossibleAttendances) * 100) : 0;

  return (
    <div className="pb-32"> {/* Increased padding for two bottom buttons */}
      <PageHeader title={`Resumen: ${group.nombre} (${subject.nombre})`} showBackButton={true} backPath={ROUTE_PATHS.SUBJECT_DETAILS.replace(':materiaId', subject.id)} />
      
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-sm text-gray-500">Asistencia General</h3>
          <p className="text-3xl font-bold text-blue-600">{overallAttendancePercentage}%</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-sm text-gray-500">Sesiones Totales</h3>
          <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
        </div>
      </div>

      <h2 className="p-4 text-lg font-medium text-gray-700 border-b border-gray-200">Sesiones</h2>
      <div className="pt-0">
        {group.sesiones.length > 0 ? (
          group.sesiones.slice().reverse().map((sesion: ClassSession) => { // Show newest first
            const presentesCount = sesion.asistencias.filter(a => a.status === AttendanceStatus.Presente || a.status === AttendanceStatus.Tarde).length;
            return (
              <ListItem
                key={sesion.id}
                primaryText={sesion.nombre || `Sesión del ${new Date(sesion.fecha).toLocaleDateString()}`}
                secondaryText={`${presentesCount}/${totalStudents} Presentes`}
                onClick={() => navigate(ROUTE_PATHS.VIEW_SESSION.replace(':grupoId', group.id).replace(':sesionId', sesion.id))}
              />
            );
          })
        ) : (
          <p className="p-4 text-center text-gray-500">No hay sesiones registradas para este grupo.</p>
        )}
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-md mx-auto">
        <button
            onClick={() => navigate(ROUTE_PATHS.MANAGE_STUDENTS.replace(':grupoId', group.id))}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
        >
            <UsersIcon className="w-5 h-5 mr-2"/>
            Estudiantes ({totalStudents})
        </button>
      </div>
      <BottomButton 
        text="Iniciar Nueva Sesión" 
        icon={<PlusIcon className="w-5 h-5"/>} 
        onClick={() => navigate(ROUTE_PATHS.TAKE_ATTENDANCE.replace(':grupoId', group.id))} 
      />
    </div>
  );
};

export default GroupSummaryPage;
    