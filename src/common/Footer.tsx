/* Noah Klein */

import { FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

import './Footer.css';

const Footer = () => {
  const iconSize = '2rem';

  return (
    <footer className="Footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Get in touch</h4>
          <p>
            <a href="mailto:bucks@osurobotics.org" target="_blank">
              bucks@osurobotics.org
            </a>
          </p>
        </div>

        <div className="footer-section centered icons">
          <h4>Connect</h4>
          <a href="https://www.instagram.com/osu.vexu/" target="_blank">
            <FaInstagram size={iconSize} />
          </a>
          <a href="https://www.linkedin.com/company/osu-vexu-robotics/" target="_blank">
            {' '}
            <FaLinkedin size={iconSize} />
          </a>
          <a href="https://www.robotevents.com/teams/VURC/BUCKS" target="_blank">
            {' '}
            <img src="assets/logos/recf.png" className="custom-icon" draggable="false" />{' '}
          </a>
          <a href="https://www.youtube.com/@BUCKSRoboticsVex" target="_blank">
            {' '}
            <FaYoutube size={iconSize} />{' '}
          </a>
        </div>

        <div className="footer-section right">
          <a href="/">
            <img src="assets/logos/BUCKSText.png" className="logo" draggable="false" />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Website designed and built by{' '}
          <a href="https://www.linkedin.com/in/noah-klein-5a215a251/" target="_blank">
            Noah Klein
          </a>
          <br />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
