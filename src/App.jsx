import React, { useState } from 'react';
import { Route, Routes } from "react-router-dom";
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
import './styles/App.css'

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
          <Route path="/search" element={<Search />} />
          <Route path="/add-pet" element={<AddPet />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pet/:id" element={<PetDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;