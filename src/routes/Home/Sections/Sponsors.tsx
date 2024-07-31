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
            <section style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '32px 0' }}>

                <div style={{ display: 'flex', padding: '3rem', backgroundColor: '#f9f9f9', justifyContent: 'center', flexWrap: 'wrap', gap: '3.5rem', textAlign: 'center', width: 'fit-content' }}>
                    {sponsors.map((sponsor, index) => (
                        <a href={sponsor.href} target="_blank">
                            <img
                                key={index}
                                src={sponsor.logo}
                                alt={sponsor.name}

                                style={{ maxWidth: '275px', maxHeight: '150px', objectFit: 'contain' }}
                            />
                        </a>
                    ))}
                </div>
            </section>
        </div >
    )
}

export default Sponsors;
