/* Noah Klein */

import Header from './Header';
import NavBar from './NavBar';
import { AboutUs, Footer, Sponsors, TeamMembers } from './Sections';

import './Sections.css';
import './Home.css';


/* React Component */
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
