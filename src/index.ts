#!/usr/bin/env node

import fs from 'fs';
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');

import { parse } from './parse';

const output = {
  episode: {
    seriesTitle: 'Zombie Story',
    episodeTitle: '1話　ニューヨークのアパートメントにて',
    creator: 'katryo',
    pages: [],
    audioMapping: { 'lets-dance': 'https://katryomusic.s3.amazonaws.com/lets_dance.mp3' },
    imageMapping: {
      building: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg',
      bt: 'https://denkinovel-dev-test.s3.amazonaws.com/bt.jpg',
    },
    colorMapping: { black: '#000000', white: '#ffffff', pink: '#fecbc8', blue: '#dceff5', green: '#dcfec8' },
    defaultBg: 'black',
    defaultMusic: '',
    defaultFilter: 'black',
    defaultTextColor: 'white',
  },
};

// console.log(chalk.red(figlet.textSync('denkinovel-parser')))

const inputPath = path.join(process.cwd(), 'input', 'episode.txt');
const text = fs.readFileSync(inputPath, 'utf8');
// const paragraphs = text.split('\n')

const outputPath = path.join(process.cwd(), 'output', 'episode.json');

const pages = parse(text);
output.episode.pages = pages;

fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
