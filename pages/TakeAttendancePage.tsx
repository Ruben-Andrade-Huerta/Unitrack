
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import { ROUTE_PATHS, ATTENDANCE_STATUS_OPTIONS, ATTENDANCE_STATUS_COLORS } from '../constants';
import { Group, Student, AttendanceStatus, StudentAttendance, Subject as SubjectType } from '../types';

const TakeAttendancePage: React.FC = () => {
  const { grupoId } = useParams<{ grupoId: string, subjectId?: string }>(); // subjectId is available but we rely on getGroupById for subject info
  const navigate = useNavigate();
  const { getGroupById, addSessionToGroup } = useContext(DataContext) as DataContextType;
  
  const [groupData, setGroupData] = useState<{ subject?: SubjectType, group?: Group } | null>(null);
  const [attendances, setAttendances] = useState<Record<string, AttendanceStatus>>({});
  const [currentDate] = useState(new Date().toISOString());

  useEffect(() => {
    if (grupoId) {
      const foundGroupData = getGroupById(grupoId); // This returns { subject, group }
      setGroupData(foundGroupData || null);

      if (foundGroupData?.group) {
        const initialAttendances: Record<string, AttendanceStatus> = {};
        foundGroupData.group.estudiantes.forEach(student => {
          initialAttendances[student.id] = AttendanceStatus.Presente; // Default to Presente
        });
        setAttendances(initialAttendances);
      }
    }
  }, [grupoId, getGroupById]);

  if (!groupData || !groupData.group) {
    return (
      <div>
        <PageHeader title="Tomar Asistencia" showBackButton={true} />
        <p className="p-4 text-center text-gray-500">Grupo no encontrado.</p>
      </div>
    );
  }

  const { group, subject } = groupData; // Subject should be available if group is found through getGroupById

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendances(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    if (!grupoId) return;
    const studentAttendances: StudentAttendance[] = group.estudiantes.map(student => ({
      studentId: student.id,
      status: attendances[student.id] || AttendanceStatus.Ausente, // Default to Ausente if not set
    }));

    addSessionToGroup(grupoId, {
      fecha: currentDate,
      asistencias: studentAttendances,
      // nombre will be set in DataContext
    });
    navigate(ROUTE_PATHS.GROUP_SUMMARY.replace(':grupoId', grupoId));
  };

  const pageTitle = subject && group 
    ? `Asistencia: ${group.nombre} (${subject.nombre})` 
    : `Asistencia: ${group?.nombre || 'Cargando...'}`;

  return (
    <div className="pb-24">
      <PageHeader title={pageTitle} showBackButton={true} backPath={ROUTE_PATHS.GROUP_SUMMARY.replace(':grupoId', group.id)} />
      <p className="p-4 text-sm text-gray-600">Fecha: {new Date(currentDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      {group.estudiantes.length === 0 && (
        <p className="p-4 text-center text-gray-500">No hay estudiantes en este grupo. Agrega estudiantes primero.</p>
      )}

      {group.estudiantes.map((student: Student) => (
        <div key={student.id} className="p-4 border-b border-gray-200">
          <p className="text-lg font-medium text-gray-800 mb-2">{student.nombre}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ATTENDANCE_STATUS_OPTIONS.map(statusOption => (
              <button
                key={statusOption}
                onClick={() => handleStatusChange(student.id, statusOption)}
                className={`py-2 px-3 rounded-md text-sm font-medium border transition-colors
                  ${attendances[student.id] === statusOption 
                    ? `${ATTENDANCE_STATUS_COLORS[statusOption]} ring-2 ring-offset-1 ${ATTENDANCE_STATUS_COLORS[statusOption].replace('bg-', 'ring-').replace('-100', '-500')}` 
                    : 'bg-gray-50 hover:bg-gray-200 text-gray-700 border-gray-300'}`}
              >
                {statusOption}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {group.estudiantes.length > 0 && (
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-md mx-auto">
            <button
                onClick={handleSaveAttendance}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
            >
                Guardar Asistencia
            </button>
        </div>
      )}
    </div>
  );
};

export default TakeAttendancePage;
