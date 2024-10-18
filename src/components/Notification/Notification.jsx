import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import './Notification.css';
import { Arrow } from '../../assets/svg';
import Avatar from '../Avatar';
import useMobileBreakpoint from '../../contexts/MobileBreakpoint/useMobileBreakpoint';
import useTimeoutState from './useTimeoutState';

const Notification = ({
  avatar = null,
  button = null,
  icon = null,
  subtitle = '',
  title = ''
}) => {
  const hasButton = !!button?.copy && !!button?.onClick;
  const { isMobileView, isNotificationHidden } = useMobileBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const restartPulseAnimation = useCallback(() => {
    setIsPulsing((prev) => !prev);
    setTimeout(() => setIsPulsing(true), 0);
  }, []);
  const [timeoutState, handleEvent] = useTimeoutState(
    hasButton,
    isMobileView,
    restartPulseAnimation
  );
  const notifRef = useRef(null);
  const arrowRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Delay opening the notification component
    const timeoutId = setTimeout(() => setIsOpen(true), 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <CSSTransition
      classNames="slide-animation"
      in={isOpen && !isNotificationHidden}
      nodeRef={notifRef}
      timeout={200}
      unmountOnExit
    >
      <div className="notification-container" ref={notifRef}>
        {!isMobileView && avatar}
        <div className="notification-text-container">
          {title && (
            <p>
              <strong>{title}</strong>
            </p>
          )}
          {subtitle && <p>{subtitle}</p>}
        </div>
        {hasButton && !icon && (
          <div className="notification-button-container">
            <CSSTransition
              classNames="fade-animation"
              in={timeoutState}
              nodeRef={arrowRef}
              timeout={200}
              unmountOnExit
            >
              <div className="bouncing-arrow" ref={arrowRef}>
                <Arrow />
              </div>
            </CSSTransition>
            <CSSTransition
              classNames="pulse-animation"
              in={isPulsing}
              nodeRef={buttonRef}
              timeout={600}
            >
              <button
                {...(isMobileView
                  ? {
                      onClick: (event) => {
                        handleEvent(event);
                        button.onClick();
                      }
                    }
                  : {})}
                disabled={!isMobileView}
                ref={buttonRef}
              >
                {button.copy}
              </button>
            </CSSTransition>
          </div>
        )}
        {icon && <div className="notification-icon-container">{icon}</div>}
      </div>
    </CSSTransition>
  );
};

Notification.propTypes = {
  avatar: PropTypes.instanceOf(Avatar),
  button: PropTypes.shape({
    copy: PropTypes.string,
    onClick: PropTypes.func
  }),
  icon: PropTypes.node,
  subtitle: PropTypes.string,
  title: PropTypes.string
};

export default Notification;
