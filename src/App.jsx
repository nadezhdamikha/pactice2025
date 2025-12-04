import React from 'react';
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
  return (
    <div>
      <Header />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
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