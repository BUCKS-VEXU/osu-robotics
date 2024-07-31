/* Noah Klein */

import Header from './Header';
import NavBar from './NavBar';
import AboutUs from './Sections/AboutUs';
import TeamMembers from './Sections/TeamMembers';
import Sponsors from './Sections/Sponsors';
import Footer from './Sections/Footer';

import './Home.css';

const Home = () => {
    return (
        <div className="Home">
            <Header />
            <NavBar />
            <AboutUs />
            <TeamMembers />
            <Sponsors />
            <Footer />
        </div>
    );
};

export default Home;
