import { parseCookies } from './cookies.js';

describe('parseCookies', () => {
  it('returns an empty object when the header is undefined', () => {
    expect(parseCookies(undefined)).toEqual({});
  });

  it('parses a single cookie', () => {
    expect(parseCookies('foo=bar')).toEqual({ foo: 'bar' });
  });

  it('parses multiple cookies separated by ;', () => {
    expect(parseCookies('a=1; b=2; c=3')).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('trims whitespace around keys and values', () => {
    expect(parseCookies('  foo  =  bar  ;  baz=qux')).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('handles cookies without a value', () => {
    expect(parseCookies('foo=; bar=baz')).toEqual({ foo: '', bar: 'baz' });
  });

  it('uses the value before the first = (browser-style)', () => {
    expect(parseCookies('token=abc=def').token).toBe('abc');
  });

  it('skips fragments without a key', () => {
    expect(parseCookies(';foo=bar')).toEqual({ foo: 'bar' });
  });
});
