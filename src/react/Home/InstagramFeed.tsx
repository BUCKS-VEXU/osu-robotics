import { useEffect } from 'react';
import './InstagramFeed.css';

const InstagramFeed = () => {
  useEffect(() => {
    if (!(window as any).instgrm) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      (window as any).instgrm.Embeds.process();
    }
  }, []);

  return (
    <section className="InstagramFeed" id="latest">
      <h2>Latest Updates</h2>

      <div className="instagram-container">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink="https://www.instagram.com/osu.vexu/"
          data-instgrm-version="14"
        />
      </div>
    </section>
  );
};

export default InstagramFeed;
