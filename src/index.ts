#!/usr/bin/env node

import fs from 'fs';
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');

// console.log(chalk.red(figlet.textSync('denkinovel-parser')))

const inputPath = path.join(process.cwd(), 'input', 'episode.txt');
const text = fs.readFileSync(inputPath, 'utf8');
// const paragraphs = text.split('\n')

// const outputPath = path.join(process.cwd(), 'output', 'episode.json')

// fs.writeFileSync(outputPath, JSON.stringify(outputJSON), 'utf8')

const _exampleOutput = {
  episode: {
    series_title: 'Zombie Story',
    episode_title: 'Episode 1',
    creator: 'katryo',
    sections: [
      { paragraphs: ['abc'], music: 'lets-dance', sound: '', filter: 'black', bg: 'building', image: '', key: '1' },
    ],
    audio_map: { 'lets-dance': 'https://katryomusic.s3.amazonaws.com/lets_dance.mp3' },
    image_map: { building: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg' },
    color_map: { black: '#000000', white: '#ffffff' },
    default_bg: 'black',
    default_filter: 'black',
    default_text_color: 'white',
  },
};

interface Section {
  paragraphs: string[];
  music: string;
  sound: string;
  filter: string;
  bg: string;
  image: string;
  id: number;
}

interface CurrentProps {
  id: number;
  music: string;
  sound: string;
  bg: string;
  filter: string;
  image: string;
  paragraphs: string[];
  chars: string[];
  bracketKey: string;
  sections: Section[];
}

const END = 'END';
const OTHERS = 'OTHERS';
const DEFAULT_BG = '';
const DEFAULT_MUSIC = '';
const DEFAULT_SOUND = '';
const DEFAULT_FILTER = '';
const DEFAULT_IMAGE = '';
const VALID_BRACKET_KEYS = ['bg', 'music', 'image', 'filter'];

const errorAction = (char: string, cur: CurrentProps, i: number, breakCount: number, text: string) => {
  const spaces = [];
  for (let index = 0; index < i; index++) {
    spaces.push(' ');
  }
  const spaceString = spaces.join('');
  throw new Error(`Parse error. Text index: ${i}. Line number: ${breakCount + 1}.\n${text}\n${spaceString}^`);
};

const ERROR_ACTION_STATE = {
  action: errorAction,
  nextState: {},
};

interface State {
  [key: string]: {
    action: Function;
    nextState: State;
  };
}

type StateAction = (char: string, cur: CurrentProps, i: number, breakCound: number, text: string) => CurrentProps;

const INIT_PROPS = {
  id: 0,
  music: DEFAULT_MUSIC,
  sound: DEFAULT_SOUND,
  bg: DEFAULT_BG,
  image: DEFAULT_IMAGE,
  filter: DEFAULT_FILTER,
  paragraphs: [],
  chars: [],
  sections: [],
  bracketKey: '',
};

const noOpAction: StateAction = (char: string, cur: CurrentProps, i: number, breakCound: number, text: string) => {
  return cur;
};

const initState: State = {
  '[': { action: noOpAction, nextState: {} }, // To be replaced with inBracketState
  ']': ERROR_ACTION_STATE,
  '\n': { action: noOpAction, nextState: {} }, // To be replaced
  END: { action: noOpAction, nextState: {} }, // To be replaced
  OTHERS: { action: noOpAction, nextState: {} }, // To be replaced
};

const pushCharAction = (char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  cur.chars.push(char);
  return cur;
};

initState.OTHERS.nextState = initState;
initState.OTHERS.action = pushCharAction;
// break action
initState['\n'].action = (_char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  const newParagraph = cur.chars.join('');
  cur.paragraphs.push(newParagraph);
  return cur;
};
initState['\n'].nextState = initState;
const endSectionAction = (_char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  const paragraph = cur.chars.join('');
  if (cur.paragraphs.length > 0 || paragraph !== '') {
    cur.paragraphs.push(paragraph);
    cur.sections.push({
      paragraphs: cur.paragraphs,
      music: cur.music,
      sound: cur.sound,
      filter: cur.filter,
      bg: cur.bg,
      image: cur.image,
      id: cur.id,
    });
    cur.chars = [];
    cur.paragraphs = [];
    cur.id += 1;
  }
  return cur;
};
initState[END].action = endSectionAction;

const endBracketAction = (char: string, cur: CurrentProps, i: number, breakCount: number, text: string) => {
  const value = cur.chars.join('');
  cur.chars = [];
  const key = cur.bracketKey;
  if (!VALID_BRACKET_KEYS.includes(key)) {
    errorAction(char, cur, i, breakCount, text);
    return {};
  }

  // e.g. [bg building] abcccdef [bg ocean] aewww
  if (key === 'bg') {
    cur = endSectionAction(char, cur, i, breakCount, text);
    cur.bg = value;
  }
  return cur;
};

// [bg  building ]
//              ^
const inBracketAfterValueState: State = {
  ' ': { action: noOpAction, nextState: {} }, // To be replaced with decideKeyAction and inBracketAfterSrcState
  '\n': { action: noOpAction, nextState: {} }, // To be replaced with decideKeyAction and inBracketAfterSrcState
  ']': { action: endBracketAction, nextState: initState },
  OTHERS: ERROR_ACTION_STATE,
};
inBracketAfterValueState[' '].nextState = inBracketAfterValueState;
inBracketAfterValueState['\n'].nextState = inBracketAfterValueState;

// [bg  building]
//        ^
const inBracketValueState: State = {
  ' ': { action: noOpAction, nextState: inBracketAfterValueState },
  '\n': { action: noOpAction, nextState: inBracketAfterValueState },
  ']': { action: endBracketAction, nextState: initState },
  OTHERS: { action: pushCharAction, nextState: {} }, // To be replaced with inBracketKeyState
};
inBracketValueState[OTHERS].nextState = inBracketValueState;

// [bg  building]
//    ^
const inBracketAfterKeyState: State = {
  ' ': { action: noOpAction, nextState: {} }, // To be replaced with decideKeyAction and inBracketAfterKeyState
  '\n': { action: noOpAction, nextState: {} }, // To be replaced with decideKeyAction and inBracketAfterKeyState
  '[': ERROR_ACTION_STATE,
  ']': ERROR_ACTION_STATE,
  OTHERS: { action: pushCharAction, nextState: inBracketValueState },
};
inBracketAfterKeyState[' '].nextState = inBracketAfterKeyState;
inBracketAfterKeyState['\n'].nextState = inBracketAfterKeyState;

const keyDetermineAction = (char: string, cur: CurrentProps, i: number, breakCount: number, text: string) => {
  const key = cur.chars.join('');
  cur.chars = [];
  console.log({ key });
  if (!VALID_BRACKET_KEYS.includes(key)) {
    errorAction(char, cur, i, breakCount, text);
  }
  cur.bracketKey = key;
  return cur;
};

// [ bg building]
//   ^
//    ^
const inBracketKeyState: State = {
  ' ': { action: keyDetermineAction, nextState: inBracketAfterKeyState },
  '\n': { action: keyDetermineAction, nextState: inBracketAfterKeyState },
  OTHERS: { action: pushCharAction, nextState: {} }, // To be replaced with inBracketKeyState
};
inBracketKeyState.OTHERS.nextState = inBracketKeyState;

// [ bg building]
// ^
//  ^
const inBracketBeforeKeyState: State = {
  ']': ERROR_ACTION_STATE,
  ' ': { action: noOpAction, nextState: {} }, // To be replaced with inBracketBeforeKeyState
  '\n': { action: noOpAction, nextState: {} }, // To be replaced with inBracketBeforeKeyState
  '[': ERROR_ACTION_STATE,
  OTHERS: { action: pushCharAction, nextState: inBracketKeyState },
};
inBracketBeforeKeyState[' '].nextState = inBracketBeforeKeyState;
inBracketBeforeKeyState['\n'].nextState = inBracketBeforeKeyState;

initState['['].nextState = inBracketBeforeKeyState;
initState['['].action = endSectionAction;

const parse = (text: string) => {
  let cur = INIT_PROPS;

  let breakCount = 0;
  let state = initState;

  const step = (char: string, i: number) => {
    if (char === '\n') {
      breakCount += 1;
    }
    let next = char;
    if (!(char in state)) {
      next = 'OTHERS';
    }
    const { action, nextState } = state[next];
    cur = action(char, cur, i, breakCount, text); // Passing whole the text is memory consuming?
    state = nextState;
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    step(char, i);
  }
  step(END, text.length - 1);

  return {
    sections: cur.sections,
  };
};

export { parse };
