import { isJson, validateText, validateUsername } from './validate.js';

describe('validateUsername', () => {
  it.each([
    ['simple', 'alice', true],
    ['with digits', 'bob42', true],
    ['underscore', 'foo_bar', true],
    ['hyphen', 'foo-bar', true],
    ['single char', 'a', true],
    ['16 chars max', 'a'.repeat(16), true],
  ])('accepts %s', (_label, value, expected) => {
    expect(validateUsername(value)).toBe(expected);
  });

  it.each([
    ['empty', ''],
    ['too long', 'a'.repeat(17)],
    ['space', 'foo bar'],
    ['special chars', 'foo!'],
    ['unicode', 'aliçe'],
    ['dot', 'foo.bar'],
    ['newline', 'foo\nbar'],
  ])('rejects %s', (_label, value) => {
    expect(validateUsername(value)).toBe(false);
  });
});

describe('validateText', () => {
  it('accepts a single character', () => {
    expect(validateText('a')).toBe(true);
  });

  it('accepts the maximum length (256 chars)', () => {
    expect(validateText('a'.repeat(256))).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(validateText('')).toBe(false);
  });

  it('rejects strings longer than 256 chars', () => {
    expect(validateText('a'.repeat(257))).toBe(false);
  });

  it('rejects strings containing a newline (single-line regex)', () => {
    expect(validateText('hello\nworld')).toBe(false);
  });
});

describe('isJson', () => {
  it.each([['"a string"'], ['{}'], ['[]'], ['{"a":1}'], ['null'], ['42'], ['true']])('accepts valid JSON %s', (input) => {
    expect(isJson(input)).toBe(true);
  });

  it.each([[''], ['{'], ['{a:1}'], ['undefined'], ['function(){}']])('rejects invalid JSON %s', (input) => {
    expect(isJson(input)).toBe(false);
  });
});
