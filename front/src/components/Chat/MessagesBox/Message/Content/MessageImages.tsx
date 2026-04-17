import { JSX } from 'react';
import classes from '../Message.module.css';
import { extractImageUrls } from '../../../utils';

function MessageImages({ text, imageData }: { text: string; imageData?: string }): JSX.Element {
  const imageUrls = extractImageUrls(text);
  return (
    <>
      {imageData ? (
        <div className={classes.image}>
          <img src={imageData} onError={(e) => e.currentTarget.remove()} />
        </div>
      ) : null}
      {imageUrls.length ? (
        <div className={classes.image}>
          <img src={imageUrls[0]} onError={(e) => e.currentTarget.remove()} />
        </div>
      ) : null}
    </>
  );
}

export default MessageImages;
