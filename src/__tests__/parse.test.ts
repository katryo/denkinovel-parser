import { parse } from '../parse';

describe('When a section does not have any tag should return only paragraphs', (): void => {
  it.each([
    [
      'half-width 1 line',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',

      ]
    ],
    [
      'half-width multiple lines',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
      ]
    ],
    [
      'full-width multiple lines',
      '　本職の詩人ともなれば、いつどんな注文があるか、わからないから、常に詩材の準備をして置くのである。\n「秋について」という注文が来れば、よし来た、と「ア」の部の引き出しを開いて、愛、青、赤、アキ、いろいろのノオトがあって、そのうちの、あきの部のノオトを選び出し、落ちついてそのノオトを調べるのである。\n　トンボ。スキトオル。と書いてある。',
      [
        '　本職の詩人ともなれば、いつどんな注文があるか、わからないから、常に詩材の準備をして置くのである。',
        '「秋について」という注文が来れば、よし来た、と「ア」の部の引き出しを開いて、愛、青、赤、アキ、いろいろのノオトがあって、そのうちの、あきの部のノオトを選び出し、落ちついてそのノオトを調べるのである。',
        '　トンボ。スキトオル。と書いてある。'
      ]
    ],
    [
      'half-width simbols',
      '~`!@#$%^&*()_-+=\[\]{};:\'"¥|?/.,<>\\',
      '~`!@#$%^&*()_-+=\[\]{};:\'"¥|?/.,<>\\'
    ],
    [
      'full-width simbols',
      '〜｀！＠＃＄％＾＆＊（）＿ー＋「」『』；：’”￥｜・？，．＜＞',
      [
        '〜｀！＠＃＄％＾＆＊（）＿ー＋「」『』；：’”￥｜・？，．＜＞',   
      ]
    ],
    [
      'blank',
      '',
      [
        ''
      ]
    ],
    [
      'should trim leading line breaks',
      '\n Text begins.',
      [
        ' Text begins.'
      ]
    ],
  ])
  ('%s', (title, paragraph, expectedParagraphs): void => {
    const response: string = parse(`${paragraph}`);
    const expected = [
      {
        id: 0,
        sections: [
          {
            'id': 0,
            'bg': '',
            'music': '',
            'sound': '',
            'image': '',
            'filter': '',
            'paragraphs': expectedParagraphs
          }
        ]
      }
    ]
    expect(response).toStrictEqual(expected);
  });
})

describe('When tags has syntax errors, an exception should be thrown', (): void=> {
  it.each([
    '[',
    ']',
    '[]',
    '[ ]',
    '[bg value',
    'bg value]',
    '[bg value[',
    ']bg value]',
    '[[bg value]',
    '[bg value]]',
    '[bg ]value]',
  ])
  ('Incorrect bracket (%s)', (incorrectBracket): void => {
    expect(()=> {parse(`${incorrectBracket}paragraph`)}).toThrow(Error);
  });

  it.each([
    ['[image value]', '[sound value'],
    ['filter value]', '[image value]']
  ])
  ('Incorrect syntax and correct syntax (%s)', (bracket1, bracket2): void => {
    expect(()=> {parse(`${bracket1}${bracket2}paragraph`)}).toThrow(Error);
  });
})

describe("When tag is incorrect, an exception should be thrown", (): void=> {
  it.each([
    'music',
    'sound',
    'filter',
    'image',
    'bg',
    'key',
  ])
  ('value does not exist (%s)', (keyName): void => {
    expect(()=> {parse(`[${keyName}]paragraph`)}).toThrow(Error);
  });

  it.each([
    'music',
    'sound',
    'filter',
    'image',
    'bg',
    'key',
  ])
  ('multiple values (%s)', (keyName): void => {
    expect(()=> {parse(`[${keyName} value1 value2]paragraph`)}).toThrow(Error);
  });

  it.each([
    [
      'one and zero',
      '[bg value]paragraph1[sound]paragraph2'
    ],
    [
      'one and two',
      '[bg value]paragraph1[sound value1 value2]paragraph2'
    ]
  ])
  ('Correct value and incorrect value (%s)', (title, sectiontags): void => {
    expect(()=> {parse(`[bg value]paragraph1[sound]paragraph2`)}).toThrow(Error);
  });
})

describe('When a tags are correct,', (): void=> {
  describe('but key names are incorrect, an exception should thorown', (): void=> {
    it.each([
      'unknown',
      'mmusic',
      'soundd',
      'ffilter',
      'imagee',
      'bgg',
    ])
    ('%s', (incorrectKeyName): void => {
      expect(()=> {parse(`[${incorrectKeyName} value]paragraph`)}).toThrow(Error);
    });

    it.each([
      ['mmusic', 'music'],
      ['sound', 'ssssound'],
      ['filter', 'filteer'],
      ['imagee', 'image'],
      ['b', 'bg']
    ])
    ('Incorrect key name and correct key name (%s,%s)', (incorrectKeyName, correctKeyname): void => {
      expect(()=> {parse(`[${incorrectKeyName} value]paragraph1[${correctKeyname} value]paragraph2`)}).toThrow(Error);
    });

    test('should trim leading line breaks', () => {
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
  })
  
  describe('and key names are correct, parsed object should be return', (): void=> {
    it.each([
      [
        'bg',
        {
          'id' : 0,
          'bg' : 'value',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph']
        }
      ],
      [
        'music',
        {
          'id' : 0,
          'bg' : '',
          'music': 'value',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph']
        }
      ],
      [
        'sound',
        {
          'id' : 0,
          'bg' : '',
          'music': '',
          'sound': 'value',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph']
        }
      ],
      [
        'image',
        {
          'id' : 0,
          'bg' : '',
          'music': '',
          'sound': '',
          'image': 'value',
          'filter': '',
          'paragraphs': ['paragraph']
        }
      ],
      [
        'filter',
        {
          'id' : 0,
          'bg' : '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': 'value',
          'paragraphs': ['paragraph']
        }
      ],
    ])
    ('%s', (keyName, parserdSection): void => {
      const response: string = parse(`[${keyName} value]paragraph`);
      const expected = [
        {
          id: 0,
          sections: [ parserdSection ]
        }
      ]
      expect(response).toStrictEqual(expected);
    });

    test('multiple', (): void => {
      const response: string = parse(`[music musicvalue][filter filtervalue][sound soundvalue][image imagevalue][bg bgvalue]paragraph`);
      const expected = [
        {
          id: 0,
          sections: [
            {
              'id': 0,
              'bg': 'bgvalue',
              'music': 'musicvalue',
              'sound': 'soundvalue',
              'image': 'imagevalue',
              'filter': 'filtervalue',
              'paragraphs': ['paragraph']
            }
          ]
        }
      ]
      expect(response).toStrictEqual(expected);
    });
  });
});

describe('When multiple sections have tags, parserd result should be return', (): void=> {
  it.each([
    [
      'bg is updated',
      'paragraph1[bg value1]paragraph2[bg value2]paragraph3',
      [
        {
          'id': 0,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph1']
        },
        {
          'id': 1,
          'bg': 'value1',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph2']
        },
        {
          'id': 2,
          'bg': 'value2',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph3']
        }
      ]
    ],
    [
      'music is updated',
      'paragraph1[music value1]paragraph2[music value2]paragraph3',
      [
        {
          'id': 0,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph1']
        },
        {
          'id': 1,
          'bg': '',
          'music': 'value1',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph2']
        },
        {
          'id': 2,
          'bg': '',
          'music': 'value2',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph3']
        }
      ]
    ],
    [
      'sound is updated',
      'paragraph1[sound value1]paragraph2[sound value2]paragraph3',
      [
        {
          'id': 0,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph1']
        },
        {
          'id': 1,
          'bg': '',
          'music': '',
          'sound': 'value1',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph2']
        },
        {
          'id': 2,
          'bg': '',
          'music': '',
          'sound': 'value2',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph3']
        }
      ]
    ],
    [
      'image is updated',
      'paragraph1[image value1]paragraph2[image value2]paragraph3',
      [
        {
          'id': 0,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph1']
        },
        {
          'id': 1,
          'bg': '',
          'music': '',
          'sound': '',
          'image': 'value1',
          'filter': '',
          'paragraphs': ['paragraph2']
        },
        {
          'id': 2,
          'bg': '',
          'music': '',
          'sound': '',
          'image': 'value2',
          'filter': '',
          'paragraphs': ['paragraph3']
        }
      ]
    ],
    [
      'filter is updated',
      'paragraph1[filter value1]paragraph2[filter value2]paragraph3',
      [
        {
          'id': 0,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph1']
        },
        {
          'id': 1,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': 'value1',
          'paragraphs': ['paragraph2']
        },
        {
          'id': 2,
          'bg': '',
          'music': '',
          'sound': '',
          'image': '',
          'filter': 'value2',
          'paragraphs': ['paragraph3']
        }
      ]
    ],
    [
      'inherited tags',
      '[bg bgvalue1]paragraph1[music musicvalue]paragraph2[bg bgvalue2]paragraph3',
      [
        {
          'id': 0,
          'bg': 'bgvalue1',
          'music': '',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph1']
        },
        {
          'id': 1,
          'bg': 'bgvalue1',
          'music': 'musicvalue',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph2']
        },
        {
          'id': 2,
          'bg': 'bgvalue2',
          'music': 'musicvalue',
          'sound': '',
          'image': '',
          'filter': '',
          'paragraphs': ['paragraph3']
        }
      ]
    ],
  ])
  ('%s', (title, tag, sections): void => {
    const response: string = parse(`${tag}`);
    const expected = [
      {
        id: 0,
        sections: sections
      }
    ]
    expect(response).toStrictEqual(expected);
  });
});

describe('When multiple pages parsed result should be resturn', (): void=> {
  it.each([
    [
      'No section',
      '[page]',
      [
        {
          id: 0,
          sections: []
        },
        {
          id: 1,
          sections: []
        }
      ]
    ],
    [
      'sections exist',
      `[bg bgvalue]section1[music musicvalue]section2\nsection2-2[page][image imagevalue]section3\nsection3-2\nsection3-3`,
      [
        {
          id: 0,
          sections: [
            {
              'id': 0,
              'bg': 'bgvalue',
              'music': '',
              'sound': '',
              'image': '',
              'filter': '',
              'paragraphs': ['section1']
            },
            {
              'id': 1,
              'bg': 'bgvalue',
              'music': 'musicvalue',
              'sound': '',
              'image': '',
              'filter': '',
              'paragraphs': ['section2', 'section2-2']
            },
          ]
        },
        {
          id: 1,
          sections: [
            {
              'id': 2,
              'bg': 'bgvalue',
              'music': 'musicvalue',
              'sound': '',
              'image': 'imagevalue',
              'filter': '',
              'paragraphs': ['section3', 'section3-2', 'section3-3']
            }
          ]
        }
      ],
    ],
  ])('has no section, parsed result should be resturn', (title, tag, parsedResult): void => {
    const response: string = parse(`${tag}`);
    expect(response).toStrictEqual(parsedResult);
  });
});