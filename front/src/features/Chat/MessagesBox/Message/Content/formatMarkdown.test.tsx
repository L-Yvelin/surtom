import { renderToStaticMarkup } from 'react-dom/server';
import { formatMarkdown } from './formatMarkdown';

const render = (text: string) => renderToStaticMarkup(formatMarkdown(text));

describe('formatMarkdown', () => {
  describe('basic', () => {
    it('plain text unchanged', () => {
      expect(render('hello world')).toBe('hello world');
    });

    it('bold', () => {
      expect(render('**gras**')).toBe('<strong>gras</strong>');
    });

    it('italic with *', () => {
      expect(render('*italique*')).toBe('<em>italique</em>');
    });

    it('italic with _', () => {
      expect(render('_italique_')).toBe('<em>italique</em>');
    });

    it('bold italic', () => {
      expect(render('***gras italique***')).toBe('<strong><em>gras italique</em></strong>');
    });

    it('underline', () => {
      expect(render('__souligné__')).toBe('<u>souligné</u>');
    });

    it('strikethrough', () => {
      expect(render('~~barré~~')).toBe('<s>barré</s>');
    });

    it('spoiler', () => {
      expect(render('||caché||')).toBe('<span>caché</span>');
    });
  });

  describe('nesting', () => {
    it('bold with nested italic: **je suis *Suisse***', () => {
      expect(render('**je suis *Suisse***')).toBe('<strong>je suis <em>Suisse</em></strong>');
    });

    it('bold inside strikethrough', () => {
      expect(render('~~**deleted bold**~~')).toBe('<s><strong>deleted bold</strong></s>');
    });
  });

  describe('escaping', () => {
    it('escaped modifier', () => {
      expect(render('\\*not italic\\*')).toBe('*not italic*');
    });

    it('single * left alone', () => {
      expect(render('just * a star')).toBe('just * a star');
    });
  });

  describe('mixed', () => {
    it('bold then italic', () => {
      expect(render('**bold** and *italic*')).toBe('<strong>bold</strong> and <em>italic</em>');
    });

    it('text before and after formatting', () => {
      expect(render('hello **world** bye')).toBe('hello <strong>world</strong> bye');
    });
  });
});
