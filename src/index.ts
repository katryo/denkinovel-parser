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
  sections: Section[];
}

const END = 'END';
const DEFAULT_BG = '';
const DEFAULT_MUSIC = '';
const DEFAULT_SOUND = '';
const DEFAULT_FILTER = '';
const DEFAULT_IMAGE = '';
const ERROR_OBJ = {
  action: (char: string, cur: CurrentProps, i: number, breakCount: number, text: string) => {
    // TODO: Show where the error happened.
    const line = text.split('\n')[breakCount];
    throw new Error(`Parse error. Text index: ${i}. Line number: ${breakCount + 1}. Line: ${line}`);
  },
  nextState: {},
};

interface State {
  [key: string]: {
    action: Function;
    nextState: State;
  };
}

type StateAction = (char: string, cur: CurrentProps, i: number, breakCound: number, text: string) => CurrentProps;

const noOpAction: StateAction = (char: string, cur: CurrentProps, i: number, breakCound: number, text: string) => {
  return {
    id: 0,
    music: DEFAULT_MUSIC,
    sound: DEFAULT_SOUND,
    bg: DEFAULT_BG,
    image: DEFAULT_IMAGE,
    filter: DEFAULT_FILTER,
    paragraphs: [],
    chars: [],
    sections: [],
  };
};

const initState: State = {
  '[': { action: noOpAction, nextState: {} }, // To be replaced with inBracketState
  ']': ERROR_OBJ,
  '\n': { action: noOpAction, nextState: {} }, // To be replaced
  END: { action: noOpAction, nextState: {} }, // To be replaced
  OTHERS: { action: noOpAction, nextState: {} }, // To be replaced
};

initState.OTHERS.nextState = initState;
initState.OTHERS.action = (char: string, cur: CurrentProps, i: number, breakCound: number, text: string) => {
  cur.chars.push(char);
  return cur;
};

initState['\n'].action = (_char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  const paragraph = cur.chars.join('');
  cur.paragraphs.push(paragraph);
  return cur;
};
initState['\n'].nextState = initState;

const endSectionAction = (_char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  const paragraph = cur.chars.join('');
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
  return cur;
};

initState[END].action = endSectionAction;
const inBracketState: State = {
  ']': { action: () => {}, nextState: initState },
  ' ': { action: () => {}, nextState: initState }, // To be replaced
  '\n': { action: () => {}, nextState: initState }, // To be replaced
  '[': ERROR_OBJ,
  OTHERS: { action: () => {}, nextState: initState }, // To be replaced
};

initState['['].nextState = inBracketState;
initState['['].action = endSectionAction;

inBracketState['\n'].nextState = inBracketState;

const parse = (text: string) => {
  let cur: CurrentProps = {
    id: 0,
    music: DEFAULT_MUSIC,
    sound: DEFAULT_SOUND,
    bg: DEFAULT_BG,
    image: DEFAULT_IMAGE,
    filter: DEFAULT_FILTER,
    paragraphs: [],
    chars: [],
    sections: [],
  };

  let i = 0;
  let breakCount = 0;
  let state = initState;

  const step = (char: string) => {
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
    step(char);
  }
  step(END);

  return {
    sections: cur.sections,
  };
};

export { parse };
