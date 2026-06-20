import { JSX } from 'react';
import classes from './MessageTool.module.css';
import answerIcon from '../../../../../assets/images/ui/answer.svg';
import deleteIcon from '../../../../../assets/images/ui/delete.svg';

interface MessageProps {
  onDelete: () => void;
  onRespond: () => void;
}

const MessageTool = ({ onDelete, onRespond }: MessageProps): JSX.Element => {
  return (
    <div className={classes.tool}>
      <button className={classes.toolButton} onClick={onRespond}>
        <img src={answerIcon} alt="reply" />
      </button>
      <button className={classes.toolButton} onClick={onDelete}>
        <img src={deleteIcon} alt="delete" />
      </button>
    </div>
  );
};

export default MessageTool;
