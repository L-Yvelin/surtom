import { JSX, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import classes from '../Message.module.css';
import { extractImageUrls } from '../../../utils/messageFormatting';
import { useModalScope } from '../../../../../stores/useInputStore';

function ImageViewer({ src, onClose }: { src: string; onClose: () => void }): JSX.Element {
  useModalScope('image-viewer', true, onClose);
  return createPortal(
    <div className={classes.imageViewer} onClick={onClose}>
      <img src={src} />
    </div>,
    document.body,
  );
}

function MessageImages({ text, imageData }: { text: string; imageData?: string }): JSX.Element {
  const imageUrls = extractImageUrls(text);
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const close = useCallback(() => setOpenUrl(null), []);

  return (
    <>
      {imageData ? (
        <div className={classes.image}>
          <img src={imageData} onError={(e) => e.currentTarget.remove()} onClick={() => setOpenUrl(imageData)} />
        </div>
      ) : null}
      {imageUrls.length ? (
        <div className={classes.image}>
          <img src={imageUrls[0]} onError={(e) => e.currentTarget.remove()} onClick={() => setOpenUrl(imageUrls[0])} />
        </div>
      ) : null}
      {openUrl ? <ImageViewer src={openUrl} onClose={close} /> : null}
    </>
  );
}

export default MessageImages;
