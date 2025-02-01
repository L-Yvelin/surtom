import React, { JSX, useState } from "react";
import classes from "./EndPage.module.css";

function EndPage(): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const resultText = "Pas de résultat pour le moment";

  const handleClose = () => setIsVisible(false);

  const handleCopy = () => {
    const copyText = `Mon score sur ${window.location.href}\n${resultText}`;
    navigator.clipboard.writeText(copyText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className={classes.pageFin}>
      <div className={classes.close} onClick={handleClose}>
        x
      </div>
      <div className={classes.crown}></div>
      <h1>Résumé de la partie 😢</h1>
      <div className={classes.copier}>{resultText}</div>
      <p className={classes.solution}></p>
      <div className={classes.boutonsFlex}>
        <div className={classes.bouton}>PARTAGER DANS LE TCHAT</div>
        <div className={classes.boutonCopier} onClick={handleCopy}>
          <img src="images/copy-icon.png" alt="copy-icon" />
          {isCopied && <div className={classes.copyChecked}>✓</div>}
        </div>
      </div>
      <div className={classes.lesCopains}>
        Du (trop de) temps libre ?
        <div className={classes.linksFlex}>
          <a
            href="https://dpt.piemontaise.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className={classes.imageIcon}
              src="https://dpt.piemontaise.com/favicon.ico"
              alt="Départementdle"
            />
            Départementdle
          </a>
          <a
            href="https://fish.embuscade.tech/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className={classes.imageIcon}
              src="images/fish.webp"
              alt="Fish"
            />
            Fish
          </a>
        </div>
      </div>
    </div>
  );
}

export default EndPage;
