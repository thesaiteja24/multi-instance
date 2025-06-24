import React, { useEffect } from 'react';
import CopyrightSection from './CopyrightSection';
import { CgPlayButton } from 'react-icons/cg';
import './Footer.css';

// import codegnanLogo from '../images/codegnan-white.webp';
// import facebook from '../images/facebook-white.webp';
// import linkedin from '../images/linkedin-white.webp';
// import twitter from '../images/twitter.webp';
// import whatsapp from '../images/whatsapp-white.webp';
// import youtube from '../images/youtube-white.webp';
// import instagram from '../images/insta-white.webp';

const Footer = () => {
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
    <>
      <footer
        className="footer lazy-background"
        data-src="/images/footer-bg.webp"
      >
        <div className="footer-container">
          <div className="footer-left">
            <div className="logo">
              <img
                src="/images/codegnan-white.webp"
                alt="Codegnan Logo"
                className="footer-logo"
                width="150"
                height="150"
              />
            </div>
            <p className="footer-text">
              With over two decades, we are bringing international teaching
              standards to the tech aspirants globally. Nurture your inner coder
              with us and take charge of your coding career with the top
              trending and high-paying technologies. This is the right time to
              enlighten your code “GNAN”.
            </p>
            <div className="social-icons-footer">
              <a
                href="https://www.facebook.com/codegnan"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/facebook.webp"
                  alt="Facebook"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://www.instagram.com/codegnan/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/insta-white.webp"
                  alt="Instagram"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://www.youtube.com/@Codegnan"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/youtube.webp"
                  alt="YouTube"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://in.linkedin.com/company/codegnan"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/linkedin-white.webp"
                  alt="LinkedIn"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://wa.me/message/V6KW6C7XJG6FK1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/whatsapp-white.webp"
                  alt="WhatsApp"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://x.com/i/flow/login?redirect_after_login=%2FCodegnandotcom"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/twitter.webp"
                  alt="Twitter"
                  width="50"
                  height="50"
                />
              </a>
            </div>
          </div>

          <div className="footer-middle">
            <h4>COMPANY</h4>
            <ul>
              <li>
                <a href="https://codegnan.com/blogs/">Blogs</a>
              </li>
              <li>
                <a href="https://codegnan.com/about-us/">About us</a>
              </li>
              <li>
                <a href="https://codegnan.com/internships/">Internships</a>
              </li>
              <li>
                <a href="https://www.placements.codegnan.com/">Placements</a>
              </li>
              <li>
                <a href="https://codegnan.com/job-accelerator-program/">
                  Job acceleration program
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-end">
            <div className="courses">
              <h4>OUR COURSES</h4>
              <ul>
                <li>
                  {' '}
                  <a href="https://codegnan.com/python-training-in-vijayawada/">
                    Python
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/core-java-training-course-in-vijayawada/">
                    Java
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/data-science-course-training-in-vijayawada/">
                    Data Science
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/machine-learning-training-in-vijayawada/">
                    Machine Learning
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/react-js-training-course-in-vijayawada/">
                    React Js
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/data-structures-and-algorithms-training-in-vijayawada/">
                    Data structures
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/c-programming-course-training-in-vijayawada/">
                    C Programming
                  </a>
                </li>
                <li>
                  {' '}
                  <a href="https://codegnan.com/software-testing-training-course-in-vijayawada/">
                    Software Testing
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Branches Section */}
        <div className="footer-branches">
          <span>OUR BRANCHES</span>
          <div className="branches-list">
            <div>
              <strong>
                <CgPlayButton className="play-icon" />
                Vijayawada
              </strong>
              <p>
                40-5-19/16, Prasad Naidu Complex, P.B.Siddhartha Busstop,
                Moghalrajpuram, Vijayawada, Andhra Pradesh, 520010.
              </p>
            </div>
            <div>
              <strong>
                <CgPlayButton className="play-icon" />
                Hyderabad: JNTUH
              </strong>
              <p>
                Kothwal Madhava Reddy Plaza, Beside Indian Oil Petrol Bunk,
                JNTUH Metro Station, Nizampet X Roads, Hyderabad, 500072.
              </p>
            </div>
            <div>
              <strong>
                <CgPlayButton className="play-icon" />
                Hyderabad: Ameerpet
              </strong>
              <p>
                First Floor, 101, PANCOM Business Center, opp. to Chennai
                Shopping Mall, Nagarjuna Nagar colony, Ameerpet, Hyderabad,
                Telangana 500073
              </p>
            </div>
            <div>
              <strong>
                <CgPlayButton className="play-icon" />
                Bengaluru
              </strong>
              <p>
                #951, 16th Main, BTM 2nd Stage, Bengaluru, Karnataka - 560076.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <CopyrightSection />
    </>
  );
};

export default Footer;
