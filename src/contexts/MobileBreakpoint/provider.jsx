import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import MobileBreakpointContext from './context';
import { MOBILE_BREAKPOINT } from '../../config';

const MobileBreakpointProvider = ({ children }) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isPageScrollable, setIsPageScrollable] = useState(isMobileView);
  const [isNotificationHidden, setIsNotificationHidden] = useState(false);

  const updateIsPageScrollable = useCallback(
    (value) => {
      if (isMobileView) {
        setIsPageScrollable(value);
      }
    },
    [isMobileView]
  );

  const updateIsNotificationHidden = useCallback(
    (value) => {
      if (isMobileView) {
        setIsNotificationHidden(value);
      }
    },
    [isMobileView]
  );

  useEffect(() => {
    if (!isMobileView) {
      setIsNotificationHidden(false);
      setIsPageScrollable(false);
    }
  }, [isMobileView, isLandscape]);

  useEffect(() => {
    const handleWindowResize = () => {
      setIsMobileView(window.innerWidth <= MOBILE_BREAKPOINT);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const value = useMemo(
    () => ({
      isLandscape,
      isMobileView,
      isNotificationHidden,
      isPageScrollable,
      updateIsPageScrollable,
      updateIsNotificationHidden
    }),
    [
      isLandscape,
      isMobileView,
      isNotificationHidden,
      isPageScrollable,
      updateIsPageScrollable,
      updateIsNotificationHidden
    ]
  );

  return (
    <MobileBreakpointContext.Provider value={value}>
      {children}
    </MobileBreakpointContext.Provider>
  );
};

MobileBreakpointProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default MobileBreakpointProvider;
