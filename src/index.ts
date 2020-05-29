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

const DEFAULT_BG = 'black';
const DEFAULT_MUSIC = '';
const DEFAULT_SOUND = '';
const OTHERS = 'OTHERS';
const ERROR_OBJ = {
  func: (char: string, charPosition: number, linePosition: number) => {
    // TODO: Show where the error happened.
    throw new Error('Parse error');
  },
  nextState: {},
};

interface State {
  [key: string]: {
    func: Function;
    nextState: State;
  };
}

const initState: State = {
  '[': { func: () => {}, nextState: {} }, // To be replaced with inBracketState
  ']': ERROR_OBJ,
  '\n': { func: () => {}, nextState: {} },
  OTHERS: { func: () => {}, nextState: {} }, // To be replaced
};

initState.OTHERS.nextState = initState;

const inBracketState: State = {
  ']': { func: () => {}, nextState: initState },
  ' ': { func: () => {}, nextState: initState }, // To be replaced
  '\n': { func: () => {}, nextState: initState }, // To be replaced
  '[': ERROR_OBJ,
  OTHERS: { func: () => {}, nextState: initState }, // To be replaced
};

initState['['].nextState = inBracketState;
inBracketState['\n'].nextState = inBracketState;

const parse = (text: string) => {
  let cur = {
    key: 0,
    music: DEFAULT_MUSIC,
    sound: DEFAULT_SOUND,
    bg: DEFAULT_BG,
    paragraphs: [],
    chars: [],
  };

  let i = 0;
  let state = initState;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char in state) {
      const { func, nextState } = state[char];
      const actionFunc = func(char); // TODO: think
      cur = actionFunc(cur);
      state = nextState;
    }
  }

  const outputJSON = {
    sections: [
      { paragraphs: ['abc'], music: 'lets-dance', sound: '', filter: 'black', bg: 'building', image: '', key: '1' },
    ],
  };
  return outputJSON;
};

export { parse };
