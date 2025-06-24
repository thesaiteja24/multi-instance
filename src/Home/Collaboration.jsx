import React, { useEffect, useRef } from 'react';

import './Collaboration.css';

const Collaboration = () => {
  const carouselRef = useRef(null);

  const collaborationList = [
    { id: 1, image: '/images/GEC.webp', alt: 'GEC' },
    { id: 2, image: '/images/KBN.webp', alt: 'KBN' },
    { id: 3, image: '/images/KIT.webp', alt: 'KIT' },
    { id: 4, image: '/images/LBC.webp', alt: 'LBC' },
    { id: 5, image: '/images/NEC.webp', alt: 'NEC' },
    { id: 6, image: '/images/SECV.webp', alt: 'SEC' },
    { id: 7, image: '/images/VIJAYAWADA.webp', alt: 'Vijayawada' },
    { id: 8, image: '/images/LOYOLA.webp', alt: 'LOYOLA' },
    { id: 9, image: '/images/GEC.webp', alt: 'GEC' },
    { id: 10, image: '/images/KBN.webp', alt: 'KBN' },
    { id: 11, image: '/images/KIT.webp', alt: 'KIT' },
    { id: 12, image: '/images/LBC.webp', alt: 'LBC' },
    { id: 13, image: '/images/NEC.webp', alt: 'NEC' },
    { id: 14, image: '/images/SECV.webp', alt: 'SEC' },
    { id: 15, image: '/images/VIJAYAWADA.webp', alt: 'Vijayawada' },
    { id: 16, image: '/images/LOYOLA.webp', alt: 'LOYOLA' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({
          left: -150,
          behavior: 'smooth',
        });

        if (carouselRef.current.scrollLeft <= 0) {
          carouselRef.current.scrollTo({
            left: carouselRef.current.scrollWidth,
            behavior: 'smooth',
          });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="collaboration-container">
      <h1 className="collaboration-title">Our Collaboration</h1>
      <div className="collaboration-carousel" ref={carouselRef}>
        {collaborationList.map(eachItem => (
          <div key={eachItem.id} className="collaboration-item">
            <img
              src={eachItem.image}
              alt={eachItem.alt}
              className="collaboration-image"
              width="300"
              height="200"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaboration;
