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

// const outputJSON = {
//   episode: {
//     series_title: 'Zombie Story',
//     episode_title: 'Episode 1',
//     creator: 'katryo',
//     sections: [
//       { paragraphs: paragraphs, bgm: 'lets-dance', se: '', filter: 'black', bg: 'building', image: '', key: '1' },
//     ],
//     audio_map: { 'lets-dance': 'https://katryomusic.s3.amazonaws.com/lets_dance.mp3' },
//     image_map: { building: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg' },
//     color_map: { black: '#000000', white: '#ffffff' },
//   },
// }
// const outputPath = path.join(process.cwd(), 'output', 'episode.json')

// fs.writeFileSync(outputPath, JSON.stringify(outputJSON), 'utf8')

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

let chars = [];
let paragraphs = [];

const initState = {
  '[': { func: () => {}, nextState: {} },
  ']': ERROR_OBJ,
  '\n': { func: () => {}, nextState: {} },
  OTHERS: { func: () => {}, nextState: {} },
};

initState.OTHERS.nextState = initState;

const inBracketState = {
  ']': { func: () => {}, nextState: initState },
  ' ': {},
  '\n': { func: () => {}, nextState: {} },
  '[': ERROR_OBJ,
  OTHERS: {},
};

initState['['].nextState = inBracketState;
inBracketState['\n'].nextState = inBracketState;

let currentMusic = DEFAULT_MUSIC;
let currentSound = DEFAULT_SOUND;
let currentBG = DEFAULT_BG;
