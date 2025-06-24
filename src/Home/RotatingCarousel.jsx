import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import './RotatingCarousel.css';

const profiles = [
  {
    id: 1,
    package: '18.2 LPA',
    company: 'Akamai',
    image: '/images/sathupati_preethi.webp',
    alt: 'sathupati_preethi',
  },
  {
    id: 2,
    package: '9.5 LPA',
    company: 'Infosys',
    image: '/images/sathupati_preethi_1.webp',
    alt: 'sathupati_preethi_1',
  },
  {
    id: 3,
    package: '7.3 LPA',
    company: 'CodeYoung',
    image: '/images/anu_raj.webp',
    alt: 'anu_raj_n',
  },
  {
    id: 4,
    package: '7 LPA',
    company: 'Healthsyst',
    image: '/images/varuni.webp',
    alt: 'varuni-br',
  },
  {
    id: 5,
    package: '7 LPA',
    company: 'TCS',
    image: '/images/morampudi_anu_sri.webp',
    alt: 'morampudi_anu_sri',
  },
  {
    id: 6,
    package: '7 LPA',
    company: 'Healthsyst',
    image: '/images/kavya.webp',
    alt: 'kavya_c',
  },
  {
    id: 7,
    package: '6.5 LPA',
    company: 'Mastech',
    image: '/images/manoj_naidu.webp',
    alt: 'manoj_naidu',
  },
  {
    id: 8,
    package: '6.5 LPA',
    company: 'Aptean',
    image: '/images/bhargavi.webp',
    alt: 'bhargavi_g_hegde',
  },
  {
    id: 9,
    package: '6.5 LPA',
    company: 'Aptean',
    image: '/images/sharath.webp',
    alt: 'sharath_s',
  },
  {
    id: 10,
    package: '6.5 LPA',
    company: 'Aptean',
    image: '/images/manu.webp',
    alt: 'manu_n',
  },
  {
    id: 11,
    package: '6.5 LPA',
    company: 'Aptean',
    image: '/images/t_shivani.webp',
    alt: 't_shivani',
  },
  {
    id: 12,
    package: '6.5 LPA',
    company: 'Aptean',
    image: '/images/suhas.webp',
    alt: 'suhas',
  },
];

const RotatingCarousel = () => {
  const { dashboardData } = useSelector(state => state.dashboard);

  const [angle, setAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [translationDistance, setTranslationDistance] = useState(200);

  const totalStudentsPlaced = useMemo(() => {
    if (!dashboardData) return 0;
    return Object.values(dashboardData.yearOFPlacement || {}).reduce(
      (acc, count) => acc + count,
      0
    );
  }, [dashboardData]);

  const getTranslationDistance = () => {
    if (window.innerWidth < 476) return 140;
    if (window.innerWidth < 576) return 180;
    if (window.innerWidth < 796) return 220;
    if (window.innerWidth < 1135) return 250;
    if (window.innerWidth < 1285) return 210;
    if (window.innerWidth < 1580) return 270;
    if (window.innerWidth < 1850) return 270;
    if (window.innerWidth > 1850) return 300;
    return 200;
  };

  useEffect(() => {
    const handleResize = () => setTranslationDistance(getTranslationDistance());
    window.addEventListener('resize', handleResize);
    setTranslationDistance(getTranslationDistance());
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      const id = setInterval(() => {
        setAngle(prev => prev + 30);
        setActiveIndex(prev => (prev + 1) % profiles.length);
      }, 800);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [isHovered]);

  const handleClick = index => setActiveIndex(index);
  const handleMouseEnter = () => {
    setIsHovered(true);
    clearInterval(intervalId);
  };
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div className="main-container">
      <img
        src="/images/spiral-bg.webp"
        alt="Spiral Background"
        className="spiral-bg"
      />
      <div className="carousel-container">
        <div className="carousel">
          {profiles.map((profile, index) => {
            const rotation = angle + index * (360 / profiles.length);
            return (
              <div
                key={profile.id}
                className={`profile ${activeIndex === index ? 'active' : ''}`}
                onClick={() => handleClick(index)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `rotate(${rotation}deg) translate(${translationDistance}px) rotate(-${rotation}deg)`,
                  transition: 'transform 0.5s ease',
                }}
              >
                <span className="name">
                  <span className="package">{profile.package}</span> <br />
                  {profile.company}
                </span>
                <div className="highlight-circle">
                  <img
                    src={profile.image}
                    alt={profile.alt}
                    className="rotate-img"
                    width="200"
                    height="200"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="center-profile">
          <div className="highlight-circle">
            <img
              src={profiles[activeIndex].image}
              alt={profiles[activeIndex].alt}
            />
          </div>
          <span className="center-text">
            <span className="package">{profiles[activeIndex].package} </span>{' '}
            {profiles[activeIndex].company}
          </span>
        </div>
      </div>
      <div className="right-section-container">
        <div className="right-section">
          <div className="text-next">
            <div className="text-content">
              <p>
                After <span className="highlight">{totalStudentsPlaced}+</span>{' '}
                <br /> Successful Placed <br /> Students
              </p>
              <h1>
                WHO IS <br /> NEXT...
              </h1>
            </div>
            <img
              src="/images/question-mark.webp"
              alt="Question Mark"
              className="question-mark"
              width="300"
              height="300"
            />
          </div>
          <div className="callback-section">
            <Link to="/request-form" className="request-callback">
              <button className="callback-button-rotating cursor-pointer">
                <img
                  src="/images/call.webp"
                  alt="call"
                  className="call cursor-pointer"
                  width="50"
                  height="50"
                />
                Request A Callback
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotatingCarousel;
