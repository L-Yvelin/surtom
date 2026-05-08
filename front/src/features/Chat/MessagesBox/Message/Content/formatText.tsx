import { JSX } from 'react';
import classes from '../Message.module.css';
import { extractUrls } from '../../../utils/messageFormatting';
import { formatMarkdown } from './formatMarkdown';

export function formatText(text: string): JSX.Element {
  const urls = extractUrls(text);
  if (urls.length === 0) return <>{formatMarkdown(text, classes.spoiler)}</>;

  const result: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  urls.forEach((url) => {
    const index = text.indexOf(url, lastIndex);
    if (index === -1) return;

    if (index > lastIndex) {
      result.push(<span key={`t${lastIndex}`}>{formatMarkdown(text.slice(lastIndex, index), classes.spoiler)}</span>);
    }

    const displayText = url.split('/')[2];
    result.push(
      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={classes.link}>
        {displayText}
      </a>,
    );

    lastIndex = index + url.length;
  });

  if (lastIndex < text.length) {
    result.push(<span key={`t${lastIndex}`}>{formatMarkdown(text.slice(lastIndex), classes.spoiler)}</span>);
  }

  return <>{result}</>;
}
