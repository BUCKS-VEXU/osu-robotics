/* Noah Klein */

import Header from './Header';
import NavBar from './NavBar';
import { AboutUs, Footer } from './Sections';

import './Sections.css';
import './VexU.css';


/* React Component */
const VexU = () => {
    return (
        <div className="VexU">
            <Header />
            <NavBar />
            <AboutUs />
            <Footer />
        </div>
    );
};

export default VexU;
