import React from 'react';
import HeroSection from '../home/HeroSection';
import SliderSection from '../home/SliderSection';
import PetsCardsSection from '../home/PetsCardsSection';
import NewsletterSection from '../home/NewsletterSection';

const Home = ({ showNotification }) => {
  return (
    <div className="home-page">
      <HeroSection />
      <SliderSection />
      <PetsCardsSection />
      <NewsletterSection showNotification={showNotification} />
    </div>
  );
};

export default Home;