import { parse } from './index';

test('Parse a no-tag text', () => {
  expect(parse('Cool beans.')).toStrictEqual({
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
  });
});

// test('Parse music tag', () => {
//   const testText = 'abc [music dance] abc';
//   const result = parse(testText);

//   expect(result).toBe({
//     sections: [
//       {
//         paragraphs: ['abc'],
//         music: '',
//         sound: '',
//         filter: '',
//         bg: '',
//         image: '',
//         key: '0',
//       },
//       {
//         paragraphs: ['def'],
//         music: 'dance',
//         sound: '',
//         filter: '',
//         bg: '',
//         image: '',
//         key: '1',
//       },
//     ],
//   });
// });
