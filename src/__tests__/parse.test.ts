import { parse } from '../parse';

test('Parse a no-tag text', () => {
  expect(parse('Cool beans.')).toStrictEqual([
    {
      paragraphs: ['Cool beans.'],
      music: 'stop',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      page: 0,
      id: 0,
    },
  ]);
});

test('Parse abc[bg building]def', () => {
  const testText = 'abc[bg building]def';
  const result = parse(testText);

  expect(result).toStrictEqual([
    {
      paragraphs: ['abc'],
      music: 'stop',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      page: 0,
      id: 0,
    },
    {
      paragraphs: ['def'],
      music: 'stop',
      sound: '',
      filter: '',
      bg: 'building',
      image: '',
      page: 0,
      id: 1,
    },
  ]);
});

test('Parse [music dance]\n Text begins.', () => {
  expect(parse('[music dance]\n Text begins.')).toStrictEqual([
    {
      paragraphs: [' Text begins.'],
      music: 'dance',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      page: 0,
      id: 0,
    },
  ]);
});

test('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.', () => {
  const result = parse('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.');
  expect(parse('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.')).toStrictEqual([
    {
      paragraphs: ['paragraph A.'],
      music: 'stop',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      page: 0,
      id: 0,
    },
    {
      paragraphs: ['Paragraph B.'],
      music: 'song',
      sound: '',
      filter: '',
      bg: 'laundry',
      image: '',
      page: 0,
      id: 1,
    },
  ]);
});

test('Page 0 text.\nStill page 0 text.\n[page]\nPage 1 text.\nThis is also a page 1 text.', () => {
  const result = parse('Page 0 text.\nStill page 0 text.\n[page]\nPage 1 text.\nThis is also a page 1 text.');
  expect(result).toStrictEqual([
    {
      paragraphs: ['Page 0 text.', 'Still page 0 text.'],
      music: 'stop',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      page: 0,
      id: 0,
    },
    {
      paragraphs: ['Page 1 text.', 'This is also a page 1 text.'],
      music: 'stop',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      page: 1,
      id: 1,
    },
  ]);
});
