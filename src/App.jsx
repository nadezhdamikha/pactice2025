import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/pages/Home';
import Search from './components/pages/Search';
import AddPet from './components/pages/AddPet';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <>
      <Header />

      {/* <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/add-pet" element={<AddPet />} />
        </Routes>
      </main> */}

      <Footer />
    </>
  );
}

export default App;
