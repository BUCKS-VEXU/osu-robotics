/* Noah Klein */

import './Sponsors.css';


const Sponsors = () => {
    const sponsors = [
        { name: 'Eaton', logo: 'media/sponsors/eaton-logo-transparent.png', href: 'https://www.eaton.com/us/en-us.html' },
        { name: 'Joseph and Joseph', logo: 'media/sponsors/joseph-joseph-logo-transparent.png', href: 'https://josephcpas.com/' },
    ];

    return (
        <div className='Sponsors'>
            <h2>Our Sponsors</h2>
            <section>
                <div>
                    {sponsors.map((sponsor, index) => (
                        <a href={sponsor.href} target="_blank">
                            <img
                                key={index}
                                src={sponsor.logo}
                                alt={sponsor.name}
                            />
                        </a>
                    ))}
                </div>
            </section>
        </div >
    )
}

export default Sponsors;
