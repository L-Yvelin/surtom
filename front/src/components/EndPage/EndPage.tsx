import { JSX, useMemo, useRef } from "react";
import classes from "./EndPage.module.css";
import classNames from "classnames";
import { getLetterColor } from "../Main/Game/Grid/types";
import { LetterState } from "../../utils/Message";
import useClickOutside from "../../hooks/useClickOutside";
import Button from "../Widgets/Button/Button";
import copyIcon from "../../assets/images/ui/copy-icon.png";
import useGameStore from "../../stores/useGameStore";
import useUIStore from "../../stores/useUIStore";
import { useWebSocketStore } from "../../stores/useWebSocketStore";
import { Client } from "../../utils/Message";

interface EndPageProps {
  endPageButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function EndPage({ endPageButtonRef }: EndPageProps): JSX.Element {
  const tries = useGameStore((state) => state.tries);
  const { sendMessage } = useWebSocketStore();
  const { showEndPage: display, setVisibility } = useUIStore();

  const endPageRef = useRef<HTMLDivElement | null>(null);
  const emojiScore = useMemo(() => {
    return tries
      .map((word) =>
        word
          .map(({ state }) => getLetterColor(state ?? LetterState.Miss))
          .join(""),
      )
      .join("\n");
  }, [tries]);

  useClickOutside(endPageRef, () => setVisibility("showEndPage", false), [
    endPageButtonRef,
  ]);

  function handleCopy() {
    const copyText = `Mon score sur ${window.location.href}\n${emojiScore}`;
    navigator.clipboard.writeText(copyText);
  }

  function shareInTchat() {
    sendMessage({
      type: Client.MessageType.SCORE_TO_CHAT,
      content: {
        attempts: tries.map((w) => w.map((l) => l.letter)),
        custom: undefined,
      },
    });
    return;
  }

  return (
    <div
      className={classNames(classes.pageFin, { [classes.hidden]: !display })}
      ref={endPageRef}
    >
      <div className={classes.emojiScore}>{emojiScore}</div>
      <div className={classes.boutonsFlex}>
        <Button
          text={"Partager le score dans le tchat"}
          onClick={() => shareInTchat()}
          className={classes.shareInTchat}
        />
        <Button
          text={
            <img src={copyIcon} alt="Copy icon" className={classes.copyIcon} />
          }
          onClick={() => handleCopy()}
          className={classes.copyScore}
          size="square"
        />
      </div>
      <Button
        text={"Fermer"}
        onClick={() => setVisibility("showEndPage", false)}
      />
    </div>
  );
}

export default EndPage;
