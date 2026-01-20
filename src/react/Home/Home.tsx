/* Noah Klein */

import Header from './Header';
import NavBar from '../common/NavBar';
import AboutUs from './AboutUs';
import InstagramFeed from './InstagramFeed';
import TeamMembers from './TeamMembers';
import Sponsors from './Sponsors';
import CallToAction from './CallToAction';

import './Home.css';

const Home = () => {
  return (
    <div className="Home">
      <Header />
      <NavBar />
      <AboutUs />
      <InstagramFeed />
      <TeamMembers />
      <Sponsors />
      <CallToAction />
    </div>
  );
};

export default Home;
