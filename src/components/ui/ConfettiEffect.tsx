
import React, { useEffect } from "react";

interface ConfettiEffectProps {
  duration?: number;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ duration = 3000 }) => {
  useEffect(() => {
    // Create confetti pieces
    const createConfetti = () => {
      const confettiContainer = document.getElementById("confetti-container");
      if (!confettiContainer) return;

      const colors = [
        "#A7C8F7", // light blue
        "#C9EAB6", // light green
        "#4285F4", // blue
        "#66BB6A", // green
      ];

      const shapes = ["confetti-square", "confetti-circle", "confetti-triangle"];

      const confettiCount = 150;

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");
        confetti.classList.add(shapes[Math.floor(Math.random() * shapes.length)]);
        
        // Randomly position confetti
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `-10px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 10 + 5;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        
        // Random rotation and delay
        const delay = Math.random() * 2;
        const rotation = Math.random() * 360;
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.animationDelay = `${delay}s`;
        
        // Set animation with random duration
        const animDuration = Math.random() * 2 + 1;
        confetti.style.animation = `confetti ${animDuration}s ease-out forwards`;
        
        confettiContainer.appendChild(confetti);
      }
    };

    createConfetti();

    // Cleanup
    const timer = setTimeout(() => {
      const confettiContainer = document.getElementById("confetti-container");
      if (confettiContainer) {
        confettiContainer.innerHTML = "";
      }
    }, duration);

    return () => {
      clearTimeout(timer);
      const confettiContainer = document.getElementById("confetti-container");
      if (confettiContainer) {
        confettiContainer.innerHTML = "";
      }
    };
  }, [duration]);

  return (
    <div
      id="confetti-container"
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
    ></div>
  );
};

export default ConfettiEffect;
