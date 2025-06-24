import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatsChart from './StatsChart';
import './BannerPage.css';

const BannerPage = () => {
  const { dashboardData, loading } = useSelector(state => state.dashboard);
  const [count, setCount] = useState(0);
  const [poster, setPoster] = useState(null);
  const videoRef = useRef(null);

  // Animate count based on yearOFPlacement
  useEffect(() => {
    let timer;
    if (!loading && dashboardData) {
      const totalPlaced = Object.values(
        dashboardData.yearOFPlacement || {}
      ).reduce((acc, value) => acc + value, 0);
      const finalCount = totalPlaced === 0 ? 0 : totalPlaced;
      let currentCount = 0;
      const duration = 1000;
      const intervalTime = 3;
      const steps = duration / intervalTime;
      const increment = finalCount / steps;

      timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= finalCount) {
          currentCount = finalCount;
          clearInterval(timer);
        }
        setCount(Math.floor(currentCount));
      }, intervalTime);
    }
    return () => clearInterval(timer);
  }, [dashboardData, loading]);

  // Automatically extract a frame from video and set as poster
  useEffect(() => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    const generatePoster = () => {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/webp');
      setPoster(dataURL);
      video.pause();
      video.currentTime = 0;
    };

    if (video) {
      video.muted = true;
      video.playsInline = true;

      const onLoaded = () => {
        video.currentTime = 1;
      };

      const onSeeked = () => {
        generatePoster();
        video.removeEventListener('seeked', onSeeked);
      };

      video.addEventListener('loadeddata', onLoaded);
      video.addEventListener('seeked', onSeeked);

      video.load(); // force reload
    }
  }, []);

  return (
    <div className="coverpage-container bg-white">
      <div className="home-cover-text-container">
        <div className="home-text-container">
          <div className="home-titles">
            <p className="home-title">
              It's <span className="span-home-title">Not Just</span> A Number
            </p>
            <p className="tag-line">
              See Successful Students{' '}
              <span className="span-home-title">Placements</span> Journey
            </p>
          </div>

          {dashboardData && (
            <div className="placement-card">
              <h1 className="student-count">
                {count}
                <span className="plus-sign">+</span>
              </h1>
              <p className="students-placed">Students Placed</p>
              <p className="counting">
                <span className="blinking">
                  &gt;&gt;&gt; Still Counting...!
                </span>
              </p>
            </div>
          )}
        </div>

        <div
          className={`stats-studentplaced-container ${
            !dashboardData ? 'loading' : ''
          }`}
        >
          {dashboardData ? (
            <StatsChart />
          ) : (
            <div style={{ width: '100%', height: '220px' }}></div> // Placeholder to avoid collapse
          )}

          <div className="video-wrapper">
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              controls
              poster={poster ?? ''}
              style={{
                backgroundColor: '#000',
                border: '1px solid black',
                borderRadius: '20px',
              }}
            >
              <source src="/images/video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>

      <div className="image-container">
        <img
          src="/images/banner-girl.webp"
          alt="Banner Girl"
          className="banner-girl"
          loading="lazy"
          width="400"
          height="300"
        />
      </div>

      {!dashboardData && !loading && (
        <p className="error-message">
          Placement data is currently unavailable.
        </p>
      )}
    </div>
  );
};

export default BannerPage;
