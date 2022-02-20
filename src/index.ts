#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
// const chalk = require('chalk');
// const clear = require('clear');
// const figlet = require('figlet');
// const program = require('commander');

import { parse } from './parse';

const imageMapping = {
  apartment: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/laptop-small.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/laptop-large.jpg',
  },
  building: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg',
  },
  buildings: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/buildings.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/buildings.jpg',
  },
  street: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/street.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/street.jpg',
  },
  bt: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/bt.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/bt.jpg',
  },
  zombie: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/zombie-simple.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/zombie-simple.jpg',
  },
  laundry: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/laundry.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/laundry.jpg',
  },
  window: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/window.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/window.jpg',
  },
  laptop: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/laptop-small.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/laptop-large.jpg',
  },
  market: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/market-small.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/market-large.jpg',
  },
  intrepid: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/intrepid-long-small.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/intrepid-long.jpg',
  },
  intrepid2: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/intrepid-entrance-small.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/intrepid-entrance.jpg',
  },
  intrepid3: {
    small: 'https://denkinovel-dev-test.s3.amazonaws.com/intrepid-inside-small.jpg',
    large: 'https://denkinovel-dev-test.s3.amazonaws.com/intrepid-inside.jpg',
  },
};

const audioMapping = { 'lets-dance': 'https://katryomusic.s3.amazonaws.com/lets_dance.mp3' };
const colorMapping = { black: '#000000', white: '#ffffff', pink: '#fecbc8', blue: '#dceff5', green: '#dcfec8' };
const defaultProps = {
  imageMapping,
  audioMapping,
  colorMapping,
  seriesTitle: 'Zombie Story',
  creator: 'katryo',
  pages: [],
  defaultBg: 'black',
  defaultMusic: '',
  defaultFilter: 'black',
  defaultTextColor: 'white',
};

const episodes = [
  {
    episode: {
      ...defaultProps,
      episodeTitle: '1話　ユキ、人に噛まれる',
    },
    formatVersion: 1,
  },
  {
    episode: {
      ...defaultProps,
      episodeTitle: '2話　スーパーマーケットで食料を漁るぞ',
    },
    formatVersion: 1,
  },
  {
    episode: {
      ...defaultProps,
      episodeTitle: '3話　これまでのあらすじ',
    },
    formatVersion: 1,
  },
];

// console.log(chalk.red(figlet.textSync('denkinovel-parser')))

for (const num of [1, 2]) {
  const inputPath = path.join(process.cwd(), 'input', `episode-${num}.txt`);
  const text = fs.readFileSync(inputPath, 'utf8');
  const outputPath = path.join(process.cwd(), 'output', `episode-${num}.json`);
  const pages = parse(text);
  const episode = episodes[num - 1];
  episode.episode.pages = pages;

  fs.writeFileSync(outputPath, JSON.stringify(episode), 'utf8');
}
