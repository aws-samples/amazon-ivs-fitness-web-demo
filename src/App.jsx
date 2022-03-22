import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ParticipantsProvider from './contexts/Participants/provider';

import Join from './pages/Join';
import Class from './pages/Class';

import useUser from './contexts/User/useUser';

import MobileBreakpointProvider from './contexts/MobileBreakpoint/provider';

const App = () => {
  const { user } = useUser();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <MobileBreakpointProvider>
      <Routes>
        <Route
          path="/class"
          element={
            <ParticipantsProvider>
              <Class />
            </ParticipantsProvider>
          }
        />

        <Route path="/join" element={<Join />} />
        <Route
          path="/*"
          element={<Navigate replace to={user.joined ? '/class' : '/join'} />}
        />
      </Routes>
    </MobileBreakpointProvider>
  );
};

export default App;
