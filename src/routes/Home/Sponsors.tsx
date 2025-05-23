/* Noah Klein */

import './Sponsors.css';


const Sponsors = () => {
    const sponsors = [
        { name: 'Eaton', logo: 'assets/sponsors/eaton-logo-transparent.png', href: 'https://www.eaton.com/us/en-us.html' },
        { name: 'Polymaker', logo: 'assets/sponsors/Polymaker-logo.png', href: 'https://polymaker.com/' },
        { name: 'Joseph and Joseph', logo: 'assets/sponsors/joseph-joseph-logo-transparent.png', href: 'https://josephcpas.com/' },
        { name: 'GK Properties', logo: 'assets/sponsors/GK-Properties-logo.png', href: 'https://www.gkpropertieslv.com/' },
        { name: 'KHM Travel Group', logo: 'assets/sponsors/KHM-logo.png', href: 'https://khmtravel.com/' },
        { name: 'Digital Sports Solutions', logo: 'assets/sponsors/DSS_CombinationMark_FullColor.svg', href: 'https://www.digitalsportssolutions.com/' },
    ];

    return (
        <section className='Sponsors'>
            <h2>Our Sponsors</h2>
            <div className='container'>
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
        </section >
    )
}

export default Sponsors;
