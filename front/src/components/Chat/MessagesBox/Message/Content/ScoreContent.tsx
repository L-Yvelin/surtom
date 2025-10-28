import { JSX } from "react";
import { Server } from "@surtom/interfaces";
import classes from "../Message.module.css";
import { getValidatedWords } from "../../../../../utils/gameLogic";
import PlayerName from "../PlayerName/PlayerName";
import Tooltip from "../../../../Tooltip/Tooltip";
import Grid from "../../../../Main/Game/Grid/Grid";
import useGameStore from "../../../../../stores/useGameStore";

function ScoreContent({
  message,
}: {
  message: Server.ChatMessage.Score;
}): JSX.Element {
  const tries = message.content.attempts;
  const answer = message.content.answer;
  const words = getValidatedWords(tries, answer);
  const { gameFinished } = useGameStore();

  return (
    <span>
      <PlayerName
        name={message.content.user.name}
        moderatorLevel={message.content.user.moderatorLevel}
      />{" "}
      <span className={classes.score}>
        finit la partie en {tries?.length} essais !{" "}
        <Tooltip
          activeOnMobile
          tooltipContent={
            <Grid
              solution={answer}
              tries={words}
              confidential={
                new Date(message.content.timestamp).getDate() ===
                  new Date().getDate() && !gameFinished()
              }
              cellSize={"2dvh"}
            />
          }
        >
          <u>(voir)</u>
        </Tooltip>
      </span>
    </span>
  );
}

export default ScoreContent;
