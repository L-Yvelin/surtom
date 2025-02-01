import React from "react";
import classes from "./AchievementsStack.module.css";
import AchievementCard, { AchievementProps } from "./Achievement/Achievement";
import SlideInOut from "./SlideInOut/SlideInOut";

interface AchievementsStackProps {
  achievements: AchievementProps[];
  setAchievements: React.Dispatch<React.SetStateAction<AchievementProps[]>>;
  lifeTime: number;
  transitionDuration: number;
}

const AchievementsStack: React.FC<AchievementsStackProps> = ({
  achievements,
  setAchievements,
  lifeTime,
  transitionDuration,
}) => {
  const handleSlideOutEnd = (id: string | number) => {
    setAchievements((prevAchievements) =>
      prevAchievements.filter((item) => item.id !== id)
    );
  };

  return (
    <div className={classes.achievements}>
      {achievements.map((achievement) => (
        <SlideInOut
          key={achievement.id}
          child={<AchievementCard {...achievement} />}
          lifeTime={lifeTime}
          transitionDuration={transitionDuration}
          side="right"
          onComplete={() => handleSlideOutEnd(achievement.id)}
        />
      ))}
    </div>
  );
};

export default AchievementsStack;
