#!/usr/bin/env node

import fs from 'fs'
const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const path = require('path')
const program = require('commander')

// console.log(chalk.red(figlet.textSync('denkinovel-parser')))

const inputPath = path.join(process.cwd(), 'input', 'episode.txt')
const text = fs.readFileSync(inputPath, 'utf8')
const paragraphs = text.split('\n')

const outputJSON = {
  episode: {
    series_title: 'Zombie Story',
    episode_title: 'Episode 1',
    creator: 'katryo',
    sections: [{ paragraphs: paragraphs, bgm: '', se: '', filter: 'black', bg: '', image: '', key: '1' }],
  },
}
const outputPath = path.join(process.cwd(), 'output', 'episode.json')

fs.writeFileSync(outputPath, JSON.stringify(outputJSON), 'utf8')
