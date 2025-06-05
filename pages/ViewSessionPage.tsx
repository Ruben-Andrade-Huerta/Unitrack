
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import { ROUTE_PATHS, ATTENDANCE_STATUS_COLORS } from '../constants';
import { Group, ClassSession, Student, Subject as SubjectType } from '../types';

const ViewSessionPage: React.FC = () => {
  const { grupoId, sesionId } = useParams<{ grupoId: string; sesionId: string }>();
  const navigate = useNavigate();
  const { getGroupById, getStudentById } = useContext(DataContext) as DataContextType;

  const [sessionData, setSessionData] = useState<{ subject?: SubjectType; group?: Group; session?: ClassSession } | null>(null);

  useEffect(() => {
    if (grupoId && sesionId) {
      const groupDetails = getGroupById(grupoId);
      if (groupDetails && groupDetails.group) {
        const foundSession = groupDetails.group.sesiones.find(s => s.id === sesionId);
        setSessionData({
          subject: groupDetails.subject,
          group: groupDetails.group,
          session: foundSession,
        });
      }
    }
  }, [grupoId, sesionId, getGroupById]);

  if (!sessionData || !sessionData.group || !sessionData.session || !sessionData.subject) {
    return (
      <div>
        <PageHeader title="Sesión no encontrada" showBackButton={true} />
        <p className="p-4 text-center text-gray-500">Los detalles de la sesión no se pudieron cargar.</p>
      </div>
    );
  }

  const { group, session, subject } = sessionData;
  const pageTitle = `${session.nombre || `Sesión del ${new Date(session.fecha).toLocaleDateString()}`} - ${group.nombre} (${subject.nombre})`;

  return (
    <div>
      <PageHeader title={pageTitle} showBackButton={true} backPath={ROUTE_PATHS.GROUP_SUMMARY.replace(':grupoId', group.id)} />
      <p className="p-4 text-sm text-gray-600">Fecha: {new Date(session.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div className="divide-y divide-gray-200">
        {session.asistencias.map(asistencia => {
          const student = getStudentById(asistencia.studentId, group.id);
          if (!student) return null;
          return (
            <div key={student.id} className={`p-4 flex justify-between items-center ${ATTENDANCE_STATUS_COLORS[asistencia.status].split(' ')[0]}`}>
              <p className="text-lg font-medium text-gray-800">{student.nombre}</p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ATTENDANCE_STATUS_COLORS[asistencia.status]}`}>
                {asistencia.status}
              </span>
            </div>
          );
        })}
      </div>
      {session.asistencias.length === 0 && (
         <p className="p-4 text-center text-gray-500">No hay registros de asistencia para esta sesión.</p>
      )}
    </div>
  );
};

export default ViewSessionPage;
    