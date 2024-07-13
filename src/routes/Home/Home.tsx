/* Noah Klein */

import Header from './Header';
import NavBar from './NavBar';
import { AboutUs, Footer, TeamMembers } from './Sections';

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
            <Footer />
        </div>
    );
};

export default Home;
