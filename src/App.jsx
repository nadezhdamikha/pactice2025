import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/pages/Home';
import Search from './components/pages/Search';
import AddPet from './components/pages/AddPet';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Profile from './components/pages/Profile';
import PetDetails from './components/pages/PetDetails';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Компонент для защиты маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Компонент для защиты маршрутов, доступных только для неавторизованных
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

function App() {
  const [notification, setNotification] = useState(null);

  // Функция для показа уведомлений
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Функция для скрытия уведомления
  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <AuthProvider>
      <div>
        <Header />
        
        {/* Компонент уведомлений */}
        {notification && (
          <div className={`alert alert-${notification.type} alert-dismissible fade show m-3 position-fixed top-0 end-0`}
               style={{zIndex: 1050, maxWidth: '400px'}}
               role="alert">
            {notification.message}
            <button type="button" className="btn-close" onClick={hideNotification}></button>
          </div>
        )}
        
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Home showNotification={showNotification} />} />
            <Route path="/search" element={<Search showNotification={showNotification} />} />
            
            {/* Маршрут /add-pet доступен всем (убрана защита) */}
            <Route path="/add-pet" element={<AddPet showNotification={showNotification} />} />
            
            {/* Защищенные маршруты - только для авторизованных */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile showNotification={showNotification} />
              </ProtectedRoute>
            } />
            
            {/* Маршруты только для гостей */}
            <Route path="/login" element={
              <GuestRoute>
                <Login showNotification={showNotification} />
              </GuestRoute>
            } />
            
            <Route path="/register" element={
              <GuestRoute>
                <Register showNotification={showNotification} />
              </GuestRoute>
            } />
            
            <Route path="/pet/:id" element={<PetDetails showNotification={showNotification} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;