import React from 'react';
import './TeamPage.css';
// import LinkedinIcon from '../images/linkedin.webp';
// import WhatsappIcon from '../images/whatsapp.webp';
// import SairamImage from '../images/sairam.webp';
// import SakethImage from '../images/saketh.webp';
// import tickMark from '../images/tick-mark.webp'
// import InstaIcon from '../images/insta.webp'
// import mark from '../images/mark.webp'

const TeamPage = () => {
  return (
    <div className="team-page bg-white">
      <header className="header">
        <h1 className="team-heading">
          <img
            src="/images/mark.webp"
            alt="mark"
            className="mark"
            width={35}
            height={35}
          />
          Meet Our Team Behind Codegnan
        </h1>
        <a
          href="https://codegnan.com/our-team/"
          target="_blank"
          rel="noreferrer"
        >
          <button className="all-team-btn">
            <span className="btn-span">All Team Members &gt;&gt;</span>
          </button>
        </a>
      </header>
      <div className="section-container">
        <section className="team-members">
          <div className="team-card sairam">
            <img
              src="/images/sairam.webp"
              alt="Uppugundla Sairam"
              className="profile-pic"
              width="150"
              height="150"
            />
            <h2 className="sairam">Uppugundla Sairam</h2>
            <p>Founder & Chief Executive Officer</p>
            <div className="social-icons-team">
              <a
                href="https://www.instagram.com/sairamuppugandla?igsh=MWVub3o5OXFvZWhvdA=="
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/insta.webp"
                  alt="Instagram"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/sairam-uppugundla/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/linkedin.webp"
                  alt="LinkedIn"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://wa.me/message/V6KW6C7XJG6FK1"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/whatsapp.webp"
                  alt="whatsapp"
                  width="50"
                  height="50"
                />
              </a>
            </div>
          </div>
          <div className="team-card saketh">
            <img
              src="/images/saketh.webp"
              alt="Kallepu Saketh Reddy"
              className="profile-pic"
              width="150"
              height="150"
            />
            <h2 className="saketh-head">Kallepu Saketh Reddy</h2>
            <p>Co-Founder and Chief Management Officer</p>
            <div className="social-icons-team">
              <a
                href="https://www.instagram.com/codewithsaketh?igsh=MTh4eXIzd21kaHRhYQ=="
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/insta.webp"
                  alt="Instagram"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/saketh-codegnan/"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/linkedin.webp"
                  alt="LinkedIn"
                  width="50"
                  height="50"
                />
              </a>
              <a
                href="https://wa.me/message/V6KW6C7XJG6FK1"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/images/whatsapp.webp"
                  alt="whatsapp"
                  width="50"
                  height="50"
                />
              </a>
            </div>
          </div>
        </section>
        <section className="description">
          <h2>Our Top Notch Teams</h2>
          <h3>
            You Learn Programming
            <span>
              ,<br />
              Not Just Coding.
            </span>
          </h3>
          <ul>
            <li>
              <img
                src="/images/tick-mark.webp"
                alt="tickMark"
                className="tick-mark"
                width="20"
                height="20"
              />
              Embark on a Journey with Elite Mentors - IIT Alumni and Top MNC
              Experts.
            </li>
            <li>
              <img
                src="/images/tick-mark.webp"
                alt="tickMark"
                className="tick-mark"
                width="20"
                height="20"
              />
              Experience Doubt-Free Learning from Product Developers.
            </li>
            <li>
              <img
                src="/images/tick-mark.webp"
                alt="tickMark"
                className="tick-mark"
                width="20"
                height="20"
              />
              Elevate Your Skills with Expert Masterclasses.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TeamPage;
