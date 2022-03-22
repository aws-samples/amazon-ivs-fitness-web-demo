import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import './Player.css';
import { DEFAULT_STREAM_URL } from '../../../config';
import Notification from '../../../components/Notification';
import Spinner from './Spinner/Spinner';
import useMobileBreakpoint from '../../../contexts/MobileBreakpoint/useMobileBreakpoint';
import usePlayer from './hooks/usePlayer';

const Player = forwardRef(({ handleAccelerationEvent }, ref) => {
  const { loading, videoRef } = usePlayer(DEFAULT_STREAM_URL);
  const { isMobileView } = useMobileBreakpoint();

  return (
    <section ref={ref} className="player-section">
      <div className="video-container">
        <Spinner loading={loading} />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={videoRef} playsInline muted></video>
      </div>
      <div className="notification-area">
        <Notification
          button={{
            copy: isMobileView ? 'Run' : 'W',
            onClick: handleAccelerationEvent
          }}
          subtitle={
            isMobileView
              ? 'Rapidly tap the “Run” button'
              : 'Rapidly press “W” to run'
          }
          title="Start Running!"
        />
        <div className="trainer-info-container">
          <p className="trainer-title">Class Instructor</p>
          <p className="trainer-name">Lara Thayer</p>
        </div>
        <div className="trainer-info-gradient" />
      </div>
    </section>
  );
});

Player.propTypes = {
  handleAccelerationEvent: PropTypes.func.isRequired
};

export default Player;
