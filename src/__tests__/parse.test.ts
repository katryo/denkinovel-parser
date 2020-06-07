import { parse } from '../parse';

test('Parse a no-tag text', () => {
  expect(parse('Cool beans.')).toStrictEqual([
    {
      sections: [
        {
          paragraphs: ['Cool beans.'],
          music: '',
          sound: '',
          filter: '',
          bg: '',
          image: '',
          id: 0,
        },
      ],
      id: 0,
    },
  ]);
});

test('Parse abc[bg building]def', () => {
  const testText = 'abc[bg building]def';
  const result = parse(testText);

  expect(result).toStrictEqual([
    {
      sections: [
        {
          paragraphs: ['abc'],
          music: '',
          sound: '',
          filter: '',
          bg: '',
          image: '',
          id: 0,
        },
        {
          paragraphs: ['def'],
          music: '',
          sound: '',
          filter: '',
          bg: 'building',
          image: '',
          id: 1,
        },
      ],
      id: 0,
    },
  ]);
});

test('Parse [music dance]\n Text begins.', () => {
  expect(parse('[music dance]\n Text begins.')).toStrictEqual([
    {
      sections: [
        {
          paragraphs: [' Text begins.'],
          music: 'dance',
          sound: '',
          filter: '',
          bg: '',
          image: '',
          id: 0,
        },
      ],
      id: 0,
    },
  ]);
});

test('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.', () => {
  expect(parse('paragraph A.\n[bg laundry]\n[music song]\nParagraph B.')).toStrictEqual([
    {
      sections: [
        {
          paragraphs: ['paragraph A.'],
          music: '',
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
      ],
      id: 0,
    },
  ]);
});

test('Page 0 text.\nStill page 0 text.\n[page]\nPage 1 text.\nThis is also a page 1 text.', () => {
  const result = parse('Page 0 text.\nStill page 0 text.\n[page]\nPage 1 text.\nThis is also a page 1 text.');
  expect(result).toStrictEqual([
    {
      sections: [
        {
          paragraphs: ['Page 0 text.', 'Still page 0 text.'],
          music: '',
          sound: '',
          filter: '',
          bg: '',
          image: '',
          id: 0,
        },
      ],
      id: 0,
    },
    {
      sections: [
        {
          paragraphs: ['Page 1 text.', 'This is also a page 1 text.'],
          music: '',
          sound: '',
          filter: '',
          bg: '',
          image: '',
          id: 1,
        },
      ],
      id: 1,
    },
  ]);
});
