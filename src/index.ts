#!/usr/bin/env node

import fs from 'fs';
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');

import { parseTextToSections } from './parse';

const output = {
  episode: {
    series_title: 'Zombie Story',
    episode_title: 'Episode 1',
    creator: 'katryo',
    sections: [],
    audio_map: { 'lets-dance': 'https://katryomusic.s3.amazonaws.com/lets_dance.mp3' },
    image_map: { building: 'https://denkinovel-dev-test.s3.amazonaws.com/nyc-building.jpg' },
    color_map: { black: '#000000', white: '#ffffff' },
    default_bg: 'black',
    default_filter: 'black',
    default_text_color: 'white',
  },
};

// console.log(chalk.red(figlet.textSync('denkinovel-parser')))

const inputPath = path.join(process.cwd(), 'input', 'episode.txt');
const text = fs.readFileSync(inputPath, 'utf8');
// const paragraphs = text.split('\n')

const outputPath = path.join(process.cwd(), 'output', 'episode.json');

const sections = parseTextToSections(text);
output.episode.sections = sections;

fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
