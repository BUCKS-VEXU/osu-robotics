/* Noah Klein */

import Header from './Header';
import NavBar from './NavBar';
import { AboutUs, Footer } from './Sections';

import './Sections.css';
import './Home.css';


/* React Component */
const Home = () => {
    return (
        <div className="Home">
            <Header />
            <NavBar />
            <AboutUs />
            <Footer />
        </div>
    );
};

export default Home;
