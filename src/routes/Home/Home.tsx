/* Noah Klein */

import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';

import { BrowserView, MobileView } from 'react-device-detect';
import { SocialIcon } from 'react-social-icons'

import ScrollableColumn from './ScrollableColumn';
import OverlayWithText from './OverlayWithText';
import './Home.css';

import { useWindowSize } from '@react-hook/window-size'

const itemsByColumn: Map<number, JSX.Element[]> = new Map([
  [0, [
    <img src="media/posters-with-coach.jpg" alt="" />,
    <div className="player-wrapper">
      <ReactPlayer
        width="100%"
        height="100%"
        url="https://youtu.be/1Q2a39_2K4I"
        playing={false}
        controls
      />
    </div>,
    <img src="media/working-on-robot.jpg" alt="" />,
    <OverlayWithText text="My MATLAB Connect 4 Bot" rgba={[0, 0, 0, 0.6]} href="https://github.com/NoahK216/MATLAB-Connect4" openInNewTab={true}>
      <img src="media/Connect-4.gif" alt="" />
    </OverlayWithText>,
    <img src="media/CU-banner.jpg" alt="" />,
  ]],

  [1, [
    <img src="media/Prom-picture.jpg" alt="" />,
    <div className="info-card">
      <h1>About Me</h1>
      <p>
        I am a Junior at The Ohio State University, pursuing a degree in Computer Science Engineering.
        I competed in the VEX Robotics Competition for 4 years throughout highschool,
        and I am president and co-founder of the VEXU Robotics Organization at The Ohio State University.
        <br /><br />
        This website exists primarily to display some of my favorite achievements. So check out my creations if you're interested!
      </p>
    </div>,
    <OverlayWithText text="Play Gaussian Oh Hell!" rgba={[0, 0, 0, 0.6]} href="gaussian-oh-hell" openInNewTab={true}>
      <img src="media/GOH-preview.jpg" alt="" />
    </OverlayWithText>,
    <img src="media/STEM-trophies.jpg" alt="" />,
    <img src="media/Waterfall.jpg" alt="" />,
    <div className="player-wrapper">
      <ReactPlayer
        width="100%"
        height="100%"
        url="https://youtu.be/0X4V6cV62Ho"
        playing={false}
        controls
      />
    </div>,
    <div className="info-card">
      <h1>Like What You See? Let's Chat!</h1>
      <p>
        I'm always open to discussing opportunities! Here's my email:<br />
        <a target="_blank" href="mailto:noah2klein16@gmail.com">noah2klein16@gmail.com</a><br /><br />
        And here are some of my socials:<br />
        <SocialIcon network="github" url="https://github.com/NoahK216" target="_blank" style={{ margin: "5px" }} />
        <SocialIcon network="linkedin" url="https://www.linkedin.com/in/noah-klein-5a215a251/" target="_blank" style={{ margin: "5px" }} />
      </p>
    </div>,
    <img src="media/Triangle-Cave.jpg" alt="" />,
  ]],

  [2, [
    <img src="media/Sunset.jpg" alt="" />,
    <OverlayWithText text='Try Heardle! Pick an album, playlist, or artist, and identify a random song from your selection.' rgba={[0, 0, 0, 0.6]} href="/heardle">
      <img src="media/HeardleTeaser.png" alt="Visit my personal heardle" />
    </OverlayWithText>,
    <div className="info-card">
      <h1>My Interests</h1>
      <div style={{ padding: "0.5vw", lineHeight: "125%" }}>
        <ul>
          <li>C</li>
          <li>React.js</li>
          <li>Robotics</li>
          <li>Nature</li>
          <li>Working out</li>
          <li>My lovely girlfriend</li>
        </ul>
      </div>
    </div>,
    <img src="media/HH-sunset.jpg" alt="" />,
    <img src="media/stage.JPG" alt="" />,
    <img src="media/Lorain-trophies.jpg" alt="" />,
  ]],
]);


/* Nonsense */
const organizeItemsIntoColumns = (itemsMap: Map<number, JSX.Element[]>, numColumns: number): JSX.Element[][] => {
  const columns: JSX.Element[][] = Array.from({ length: numColumns }, () => []);

  itemsMap.forEach((items, columnIndex) => {
    items.forEach((item, _) => {
      columns[columnIndex % numColumns].push(item);
    });
  });

  return columns;
};



/* React Component */
const Home = () => {

  const calculateColumnCount = (): number => {
    const ratio = window.innerWidth / window.innerHeight;
    return ratio >= 1.2 ? 3 : ratio >= 0.6 ? 2 : 1;
  }


  /* States */
  const [width, height] = useWindowSize();
  const [scrollPercent, setScrollPercent] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [columnCount, setColumnCount] = useState(calculateColumnCount());
  const [columnHeights, setColumnHeights] = useState<number[]>([0, 0, 0]);
  const [organizedColumns, setOrganizedColumns] = useState<JSX.Element[][]>(organizeItemsIntoColumns(itemsByColumn, columnCount));

  const setColumnHeight = (index: number, height: number) => {
    setColumnHeights(prevHeights => {
      const newHeights = [...prevHeights];
      newHeights[index] = height;
      return newHeights;
    });
  };


  /* Callbacks */
  const handleScroll = useCallback((_: Event) => {
    setScrollY(window.scrollY);
  }, []);

  const handleResize = useCallback(() => {
    setColumnCount(calculateColumnCount());
  }, []);


  /* Effects */
  useEffect(() => {
    document.title = "Noah's Portfolio";
    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, handleResize]);


  useEffect(() => {
    setScrollPercent(window.scrollY / (Math.max(...columnHeights) - window.innerHeight))
  }, [scrollY, columnHeights]);

  useEffect(() => {
    setOrganizedColumns(organizeItemsIntoColumns(itemsByColumn, columnCount));
  }, [columnCount])


  return (
    <div className="Home">
      <BrowserView className='browser'>
        {organizedColumns.map((column, columnIndex) => (
          <ScrollableColumn
            key={columnIndex}
            scrollPercent={scrollPercent}
            largestColumnHeight={Math.max(...columnHeights)}
            setColumnHeight={(height: number) => { setColumnHeight(columnIndex, height) }}
            width={width}
            height={height}
          >

            {column.map((item, itemIndex) => {
              return <React.Fragment key={itemIndex}>{item}</React.Fragment>;
            })}

          </ScrollableColumn>
        ))}
      </BrowserView>

      <MobileView className='mobile-column'>
        {Array.from(itemsByColumn.values()).flat().map((item, index) => (
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </MobileView>
    </div>
  );
};

export default Home;
