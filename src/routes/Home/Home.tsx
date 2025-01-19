/* Noah Klein */

import Header from './Header';
import NavBar from '../../common/NavBar';
import AboutUs from './AboutUs';
import TeamMembers from './TeamMembers';
import Sponsors from './Sponsors';

import './Home.css';

const Home = () => {
    return (
        <div className="Home">
            <Header />
            <NavBar />
            <AboutUs />
            <TeamMembers />
            <Sponsors />
        </div>
    );
};

export default Home;
