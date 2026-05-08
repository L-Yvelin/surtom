import { extractImageUrls, extractUrls } from './messageFormatting';

describe('extractUrls', () => {
  test('returns [] when no URL is present', () => {
    expect(extractUrls('hello world')).toStrictEqual([]);
  });

  test('extracts a single https URL', () => {
    expect(extractUrls('check https://example.com here')).toStrictEqual(['https://example.com']);
  });

  test('extracts an http URL', () => {
    expect(extractUrls('go to http://example.com now')).toStrictEqual(['http://example.com']);
  });

  test('extracts multiple URLs in order', () => {
    expect(extractUrls('a https://a.com b http://b.org')).toStrictEqual(['https://a.com', 'http://b.org']);
  });

  test('preserves the path and query string', () => {
    expect(extractUrls('see https://x.com/path?q=1&z=2')).toStrictEqual(['https://x.com/path?q=1&z=2']);
  });

  test('strips trailing sentence punctuation from extracted URLs', () => {
    expect(extractUrls('hi https://x.com.')).toStrictEqual(['https://x.com']);
    expect(extractUrls('see https://x.com, ok?')).toStrictEqual(['https://x.com']);
    expect(extractUrls('one https://x.com... two')).toStrictEqual(['https://x.com']);
    expect(extractUrls('huh? https://x.com!')).toStrictEqual(['https://x.com']);
  });

  test('preserves non-sentence-punctuation tail characters', () => {
    // Closing parens / brackets / slashes are sometimes meaningful path elements,
    // so we keep them. Only `.,;:!?` are stripped.
    expect(extractUrls('see https://x.com/path/')).toStrictEqual(['https://x.com/path/']);
    expect(extractUrls('see https://en.wikipedia.org/wiki/Foo_(bar)')).toStrictEqual(['https://en.wikipedia.org/wiki/Foo_(bar)']);
  });
});

describe('extractImageUrls', () => {
  test('returns [] when no image URL is present', () => {
    expect(extractImageUrls('https://example.com/page')).toStrictEqual([]);
  });

  test.each(['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'])('extracts .%s URLs', (ext) => {
    const url = `https://cdn.example.com/img.${ext}`;
    expect(extractImageUrls(`look ${url} cool`)).toStrictEqual([url]);
  });

  test('preserves a query string after the extension', () => {
    const url = 'https://cdn.example.com/img.png?v=42';
    expect(extractImageUrls(url)).toStrictEqual([url]);
  });

  test('ignores http (non-https) image URLs (current contract)', () => {
    expect(extractImageUrls('http://example.com/img.png')).toStrictEqual([]);
  });

  test('extracts multiple image URLs', () => {
    const a = 'https://a.com/x.png';
    const b = 'https://b.com/y.gif';
    expect(extractImageUrls(`${a} and ${b}`)).toStrictEqual([a, b]);
  });

  test('ignores extensions outside the supported set', () => {
    expect(extractImageUrls('https://example.com/file.bmp')).toStrictEqual([]);
    expect(extractImageUrls('https://example.com/clip.mp4')).toStrictEqual([]);
  });
});
