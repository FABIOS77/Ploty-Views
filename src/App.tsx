import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ActivitiesPage } from './pages/activities/ActivitiesPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ShopPage } from './pages/shop/ShopPage';
import { ReportsPage } from './pages/reports/ReportsPage';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Main Workspace Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/activities" replace />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/activities" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
