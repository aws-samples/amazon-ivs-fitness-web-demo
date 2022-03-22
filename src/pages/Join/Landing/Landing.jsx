import React from 'react';

import useMobileBreakpoint from '../../../contexts/MobileBreakpoint/useMobileBreakpoint';

import './Landing.css';

const Landing = () => {
  const { isMobileView } = useMobileBreakpoint();

  return (
    <section className="landing-section">
      <header>
        <h1>Amazon IVS {!isMobileView && <br />} Interactive Fitness demo</h1>
      </header>
    </section>
  );
};

export default Landing;
