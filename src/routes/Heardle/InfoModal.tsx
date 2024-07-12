/* Noah Klein */

import './InfoModal.css';

interface InfoModalProps {
  closeModal: () => void;
}

const InfoModal = ({ closeModal }: InfoModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1 style={{ textAlign: "center" }}>Welcome to Heardle!</h1>
        <p>
          Heardle is a game where you pick the album, playlist, or artist. Then try to identify a random song from your selection.<br />
          You can also copy playlist links directly from spotify as long as your account has access to the playlist.<br />
        </p>

        <ul className="modal-list">
          <li>The sun or moon icon allows you to toggle night theme on and off</li>
          <li>The refresh button will start a new game with a new song from your music selection</li>
          <li>Enabling the checkbox will show only search results from your current selection (Cheat mode)</li>
          <li>The search button toggles between music selection and the guessing game</li>
        </ul>

        <p>
          Note that Heardle is currently still under development and awaiting permission from Spotify for a quota extension.
          If you would like to play, please email me at noah2klein16@gmail.com with your name and email address registered with your spotify account.
        </p>

        <button className="modal-close-button" onClick={closeModal}>Close</button>

      </div>
    </div>
  );
};

export default InfoModal;
