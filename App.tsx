
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsListPage from './pages/SubjectsListPage';
import AddSubjectPage from './pages/AddSubjectPage';
import SubjectDetailsPage from './pages/SubjectDetailsPage';
import AddGroupPage from './pages/AddGroupPage';
import GroupSummaryPage from './pages/GroupSummaryPage';
import TakeAttendancePage from './pages/TakeAttendancePage';
import ViewSessionPage from './pages/ViewSessionPage';
import ManageStudentsPage from './pages/ManageStudentsPage';
import AddStudentPage from './pages/AddStudentPage';
import { DataContext, DataContextType } from './contexts/DataContext';
import { ROUTE_PATHS } from './constants';

const App: React.FC = () => {
  const { isAuthenticated } = useContext(DataContext) as DataContextType;

  return (
    <HashRouter>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <Routes>
          <Route path={ROUTE_PATHS.LOGIN} element={!isAuthenticated ? <LoginPage /> : <Navigate to={ROUTE_PATHS.DASHBOARD} />} />
          
          <Route path={ROUTE_PATHS.DASHBOARD} element={isAuthenticated ? <DashboardPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.SUBJECTS_LIST} element={isAuthenticated ? <SubjectsListPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.ADD_SUBJECT} element={isAuthenticated ? <AddSubjectPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.SUBJECT_DETAILS} element={isAuthenticated ? <SubjectDetailsPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.ADD_GROUP} element={isAuthenticated ? <AddGroupPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.GROUP_SUMMARY} element={isAuthenticated ? <GroupSummaryPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.TAKE_ATTENDANCE} element={isAuthenticated ? <TakeAttendancePage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.VIEW_SESSION} element={isAuthenticated ? <ViewSessionPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.MANAGE_STUDENTS} element={isAuthenticated ? <ManageStudentsPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />
          <Route path={ROUTE_PATHS.ADD_STUDENT} element={isAuthenticated ? <AddStudentPage /> : <Navigate to={ROUTE_PATHS.LOGIN} />} />

          <Route path="*" element={<Navigate to={isAuthenticated ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.LOGIN} />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
    