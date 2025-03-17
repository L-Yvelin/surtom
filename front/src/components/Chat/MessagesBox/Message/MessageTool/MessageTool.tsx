import { JSX } from "react";
import classes from "./MessageTool.module.css";

interface MessageProps {
  onDelete: () => void;
  onRespond: () => void;
}

const MessageTool = ({ onDelete, onRespond }: MessageProps): JSX.Element => {
  return (
    <div className={classes.tool}>
      <button className={classes.toolButton} onClick={onRespond}>
        <i className="fas fa-reply"></i>
      </button>
      <button className={classes.toolButton} onClick={onDelete}>
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default MessageTool;
