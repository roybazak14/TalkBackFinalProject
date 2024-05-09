import React, { useEffect, useState } from "react";
import notificationSound from "../../../src/assets/sounds/message-sound.mp3";
import gameSound from "../../../src/assets/sounds/game-sound.mp3";

const NotificationAlert = ({
  otherUser,
  sender,
  onAccept,
  onClose,
  isGame,
  message,
}) => {
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    let sound = null;

    if (isGame) {
      sound = new Audio(gameSound);
    } else {
      sound = new Audio(notificationSound);
    }

    if (playSound) {
      sound.play();
    }

    return () => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    };
  }, [isGame, playSound]);

  useEffect(() => {
    // When a new notification is received, play the sound
    setPlaySound(true);

    // Play sound only for 3 seconds
    const soundTimer = setTimeout(() => {
      setPlaySound(false);
    }, 3000);

    return () => clearTimeout(soundTimer);
  }, [otherUser]);

  return (
    <>
      {isGame && (
        <div>
          <h3>Game invite from {otherUser}</h3>
          <button onClick={onAccept}>Accept</button>
          <button onClick={onClose}>Deny</button>
        </div>
      )}
    </>
  );
};

export default NotificationAlert;
