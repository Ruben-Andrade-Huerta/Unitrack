
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import BottomButton from '../components/BottomButton';
import ListItem from '../components/ListItem';
import { PlusIcon } from '../components/icons';
import { ROUTE_PATHS } from '../constants';
import { Group, Student, Subject as SubjectType } from '../types';

const ManageStudentsPage: React.FC = () => {
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
        <PageHeader title="Estudiantes" showBackButton={true} />
        <p className="p-4 text-center text-gray-500">Grupo no encontrado.</p>
      </div>
    );
  }

  const { group, subject } = groupData;
  const pageTitle = `Estudiantes: ${group.nombre} (${subject.nombre})`;

  return (
    <div className="pb-20">
      <PageHeader title={pageTitle} showBackButton={true} backPath={ROUTE_PATHS.GROUP_SUMMARY.replace(':grupoId', group.id)} />
      <div className="pt-2">
        {group.estudiantes.length > 0 ? (
          group.estudiantes.map((student: Student) => (
            <ListItem
              key={student.id}
              primaryText={student.nombre}
              secondaryText={`ID: ${student.studentId}`}
              showArrow={false} // Or navigate to student details if implemented
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">No hay estudiantes en este grupo.</p>
        )}
      </div>
      <BottomButton 
        text="Agregar Nuevo Estudiante" 
        icon={<PlusIcon className="w-5 h-5"/>} 
        onClick={() => navigate(ROUTE_PATHS.ADD_STUDENT.replace(':grupoId', group.id))} 
      />
    </div>
  );
};

export default ManageStudentsPage;
    