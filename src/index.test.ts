import { parse } from './index';

test('adds 1 + 2 to equal 3', () => {
  const testText = 'abc [music dance] abc';
  const result = parse(testText);

  expect(result).toBe({
    sections: [
      {
        paragraphs: ['abc'],
        music: '',
        sound: '',
        filter: '',
        bg: '',
        image: '',
        key: '0',
      },
      {
        paragraphs: ['def'],
        music: 'dance',
        sound: '',
        filter: '',
        bg: '',
        image: '',
        key: '1',
      },
    ],
  });
});
