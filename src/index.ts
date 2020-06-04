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
    episodeTitle: 'Episode 1',
    creator: 'katryo',
    sections: [],
    audioMap: { 'lets-dance': 'https://katryomusic.s3.amazonaws.com/lets_dance.mp3' },
    imageMap: { building: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg' },
    colorMap: { black: '#000000', white: '#ffffff' },
    defaultBg: 'black',
    defaultFilter: 'black',
    defaultTextColor: 'white',
  },
};

// console.log(chalk.red(figlet.textSync('denkinovel-parser')))

const inputPath = path.join(process.cwd(), 'input', 'episode.txt');
const text = fs.readFileSync(inputPath, 'utf8');
// const paragraphs = text.split('\n')

const outputPath = path.join(process.cwd(), 'output', 'episode.json');

const sections = parse(text);
output.episode.sections = sections;

fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
