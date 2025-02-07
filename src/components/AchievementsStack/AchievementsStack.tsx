import React from "react";
import classes from "./AchievementsStack.module.css";
import AchievementCard from "./Achievement/Achievement";
import SlideInOut from "./SlideInOut/SlideInOut";
import useGameStore from "../../stores/useGameStore";

interface AchievementsStackProps {
  lifeTime: number;
  transitionDuration: number;
}

const AchievementsStack: React.FC<AchievementsStackProps> = ({
  lifeTime,
  transitionDuration,
}) => {
  const { achievements, removeAchievement } = useGameStore();
  const handleSlideOutEnd = (id: string) => {
    removeAchievement(id);
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
