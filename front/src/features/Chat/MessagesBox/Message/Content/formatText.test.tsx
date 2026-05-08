import { renderToStaticMarkup } from 'react-dom/server';
import { formatText } from './formatText';

const render = (text: string) => renderToStaticMarkup(formatText(text));

describe('formatText', () => {
  test('plain text without URLs is forwarded to markdown renderer', () => {
    expect(render('hello **world**')).toBe('hello <strong>world</strong>');
  });

  test('renders a single URL as a link with the host as display text', () => {
    expect(render('https://example.com')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="link">example.com</a>',
    );
  });

  test('preserves text before and after the URL', () => {
    expect(render('hi https://example.com bye')).toBe(
      '<span>hi </span><a href="https://example.com" target="_blank" rel="noopener noreferrer" class="link">example.com</a><span> bye</span>',
    );
  });

  test('handles two URLs back to back', () => {
    expect(render('https://a.com https://b.org')).toBe(
      '<a href="https://a.com" target="_blank" rel="noopener noreferrer" class="link">a.com</a>' +
        '<span> </span>' +
        '<a href="https://b.org" target="_blank" rel="noopener noreferrer" class="link">b.org</a>',
    );
  });

  test('applies markdown formatting to the surrounding text', () => {
    expect(render('see **this** https://example.com now')).toBe(
      '<span>see <strong>this</strong> </span>' +
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="link">example.com</a>' +
        '<span> now</span>',
    );
  });

  test('does not include trailing sentence punctuation in the link or display text', () => {
    expect(render('see https://example.com.')).toBe(
      '<span>see </span>' +
        '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="link">example.com</a>' +
        '<span>.</span>',
    );
  });
});
