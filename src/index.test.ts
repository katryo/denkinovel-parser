import { parse } from './index';

// test('Parse a no-tag text', () => {
//   expect(parse('Cool beans.')).toStrictEqual({
//     sections: [
//       {
//         paragraphs: ['Cool beans.'],
//         music: '',
//         sound: '',
//         filter: '',
//         bg: '',
//         image: '',
//         id: 0,
//       },
//     ],
//   });
// });

test('Parse music tag', () => {
  const testText = 'abc[bg building]def';
  const result = parse(testText);

  expect(result).toStrictEqual({
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
  });
});
