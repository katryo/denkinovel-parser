import { parse } from '../parse';

test('Parse a no-tag text', () => {
  expect(parse('Cool beans.')).toStrictEqual([
    {
      paragraphs: ['Cool beans.'],
      music: 'none',
      sound: '',
      filter: '',
      bg: '',
      image: '',
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
      music: 'none',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      id: 0,
    },
    {
      paragraphs: ['def'],
      music: 'none',
      sound: '',
      filter: '',
      bg: 'building',
      image: '',
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
      id: 0,
    },
  ]);
});

test('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.', () => {
  const result = parse('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.');
  console.log(JSON.stringify(result));
  expect(parse('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.')).toStrictEqual([
    {
      paragraphs: ['paragraph A.'],
      music: 'none',
      sound: '',
      filter: '',
      bg: '',
      image: '',
      id: 0,
    },
    {
      paragraphs: ['Paragraph B.'],
      music: 'song',
      sound: '',
      filter: '',
      bg: 'laundry',
      image: '',
      id: 1,
    },
  ]);
});
