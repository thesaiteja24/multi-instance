import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CourseQuerySection.css';

const CourseQuerySection = () => {
  useEffect(() => {
    const lazyBackgrounds = document.querySelectorAll('.lazy-background');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyBg = entry.target;
            lazyBg.style.backgroundImage = `url(${lazyBg.dataset.src})`;
            observer.unobserve(lazyBg);
          }
        });
      });

      lazyBackgrounds.forEach(bg => observer.observe(bg));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyBackgrounds.forEach(bg => {
        bg.style.backgroundImage = `url(${bg.dataset.src})`;
      });
    }
  }, []);

  return (
    <div className="query-section bg-white">
      <div
        className="query-background lazy-background"
        data-src="/images/question-bg.webp"
      >
        <div className="query-content">
          <h1>Still have questions regarding courses?</h1>
          <p>
            Talk to our team and get support in identifying the right tech
            career course for you. Our team will answer your questions regarding
            courses, fees, batch details, and more.
          </p>
          <Link to="/request-form" className="request-callback">
            <button className="callback-button-query">
              <img
                src="/images/call.webp"
                alt="call"
                className="call"
                width="50"
                height="50"
              />
              Request A Callback
            </button>
          </Link>
        </div>
        <img
          src="/images/student.webp"
          alt="Student"
          className="student-img"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CourseQuerySection;
