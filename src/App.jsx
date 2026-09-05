import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BarmenView } from './components/BarmenView';
import { AdminView } from './components/AdminView';
import { LoginPage } from './components/LoginPage';

const MainLayout = () => {
  const { currentUser, currentView } = useApp();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {currentView === 'barmen' ? <BarmenView /> : <AdminView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
