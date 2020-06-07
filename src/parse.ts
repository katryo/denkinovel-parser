#!/usr/bin/env node

interface Section {
  paragraphs: string[];
  music: string;
  sound: string;
  filter: string;
  bg: string;
  image: string;
  page: number;
  id: number;
}

interface CurrentProps {
  id: number;
  page: number;
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
const PAGE = 'page';
const DEFAULT_BG = '';
const DEFAULT_MUSIC = 'stop';
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

const DUMMY_STATE = 'DUMMY_STATE';

interface ActionNextState {
  action: Function;
  nextState: State | 'DUMMY_STATE';
}

const STATE_KEYS = ['[', ']', ' ', '\n', 'END', 'OTHERS'];

type StateKey = '[' | ']' | ' ' | '\n' | 'END' | 'OTHERS';

interface State {
  '[': ActionNextState;
  ']': ActionNextState;
  ' ': ActionNextState;
  '\n': ActionNextState;
  END: ActionNextState;
  OTHERS: ActionNextState;
}

type StateAction = (char: string, cur: CurrentProps, i: number, breakCound: number, text: string) => CurrentProps;

const ERROR_ACTION_STATE: ActionNextState = {
  action: errorAction,
  nextState: DUMMY_STATE,
};

const INIT_PROPS = {
  id: 0,
  page: 0,
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
  '[': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with inBracketState
  ']': ERROR_ACTION_STATE,
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
  END: { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
  OTHERS: { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
};

const pushCharAction = (char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  cur.chars.push(char);
  return cur;
};

initState.OTHERS.nextState = initState;
initState.OTHERS.action = pushCharAction;
initState[' '].nextState = initState;
initState[' '].action = pushCharAction;

// break action
initState['\n'].action = (_char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  const newParagraph = cur.chars.join('');
  cur.paragraphs.push(newParagraph);
  cur.chars = [];
  return cur;
};
initState['\n'].nextState = initState;

const endSectionAction = (_char: string, cur: CurrentProps, _i: number, _breakCound: number, _text: string) => {
  const paragraph = cur.chars.join('');
  cur.chars = [];
  if (paragraph !== '') {
    cur.paragraphs.push(paragraph);
  }

  if (cur.paragraphs.length > 0) {
    cur.sections.push({
      paragraphs: cur.paragraphs,
      music: cur.music,
      sound: cur.sound,
      filter: cur.filter,
      bg: cur.bg,
      image: cur.image,
      page: cur.page,
      id: cur.id,
    });
    cur.paragraphs = [];
    cur.id += 1;
  }
  return cur;
};
initState[END].action = endSectionAction;

//----------------------------------------

const afterEndBracketState: State = {
  '[': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with inBracketState
  ']': ERROR_ACTION_STATE,
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
  END: { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
  OTHERS: { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced
};

//------------------------------------------

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
    cur.bg = value;
  }

  if (key === 'music') {
    cur.music = value;
  }
  return cur;
};

// [bg  building ]
//              ^
const inBracketAfterValueState: State = {
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with decideKeyAction and inBracketAfterSrcState
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with decideKeyAction and inBracketAfterSrcState
  ']': { action: endBracketAction, nextState: afterEndBracketState },
  '[': ERROR_ACTION_STATE,
  END: ERROR_ACTION_STATE,
  OTHERS: ERROR_ACTION_STATE,
};
inBracketAfterValueState[' '].nextState = inBracketAfterValueState;
inBracketAfterValueState['\n'].nextState = inBracketAfterValueState;

// [bg  building]
//        ^
const inBracketValueState: State = {
  ' ': { action: noOpAction, nextState: inBracketAfterValueState },
  '\n': { action: noOpAction, nextState: inBracketAfterValueState },
  ']': { action: endBracketAction, nextState: afterEndBracketState },
  '[': ERROR_ACTION_STATE,
  END: ERROR_ACTION_STATE,
  OTHERS: { action: pushCharAction, nextState: DUMMY_STATE }, // To be replaced with inBracketKeyState
};
inBracketValueState[OTHERS].nextState = inBracketValueState;

// [bg  building]
//    ^
const inBracketAfterKeyState: State = {
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with decideKeyAction and inBracketAfterKeyState
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with decideKeyAction and inBracketAfterKeyState
  '[': ERROR_ACTION_STATE,
  ']': ERROR_ACTION_STATE,
  END: ERROR_ACTION_STATE,
  OTHERS: { action: pushCharAction, nextState: inBracketValueState },
};
inBracketAfterKeyState[' '].nextState = inBracketAfterKeyState;
inBracketAfterKeyState['\n'].nextState = inBracketAfterKeyState;

const keyDetermineAction = (char: string, cur: CurrentProps, i: number, breakCount: number, text: string) => {
  const key = cur.chars.join('');
  cur.chars = [];
  if (!VALID_BRACKET_KEYS.includes(key)) {
    errorAction(char, cur, i, breakCount, text);
  }
  cur.bracketKey = key;
  return cur;
};

const singleKeywordTagEndAction = (char: string, cur: CurrentProps, i: number, breakCount: number, text: string) => {
  if (cur.chars.join('') === PAGE) {
    cur.chars = [];
    cur.page += 1;
    return cur;
  }
  errorAction(char, cur, i, breakCount, text);
  return {};
};

//------------------------------------

// [ bg building]
//   ^
//    ^
const inBracketKeyState: State = {
  ' ': { action: keyDetermineAction, nextState: inBracketAfterKeyState },
  '\n': { action: keyDetermineAction, nextState: inBracketAfterKeyState },
  END: ERROR_ACTION_STATE,
  '[': ERROR_ACTION_STATE,
  ']': { action: singleKeywordTagEndAction, nextState: afterEndBracketState },
  OTHERS: { action: pushCharAction, nextState: DUMMY_STATE }, // To be replaced with inBracketKeyState
};
inBracketKeyState.OTHERS.nextState = inBracketKeyState;

//------------------------------------

// [ bg building]
// ^
//  ^
const inBracketBeforeKeyState: State = {
  ']': ERROR_ACTION_STATE,
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with inBracketBeforeKeyState
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with inBracketBeforeKeyState
  '[': ERROR_ACTION_STATE,
  END: ERROR_ACTION_STATE,
  OTHERS: { action: pushCharAction, nextState: inBracketKeyState },
};
inBracketBeforeKeyState[' '].nextState = inBracketBeforeKeyState;
inBracketBeforeKeyState['\n'].nextState = inBracketBeforeKeyState;
// singleKeywordBracketEndState['['].nextState = inBracketBeforeKeyState;

initState['['].nextState = inBracketBeforeKeyState;
initState['['].action = endSectionAction;

afterEndBracketState['\n'].nextState = initState;
afterEndBracketState.OTHERS.action = pushCharAction;
afterEndBracketState.OTHERS.nextState = initState;
afterEndBracketState[' '].action = pushCharAction;
afterEndBracketState[' '].nextState = initState;
afterEndBracketState['['].nextState = inBracketBeforeKeyState;
afterEndBracketState.END.action = endSectionAction;

const isStateKey = (key: string): key is StateKey => {
  return STATE_KEYS.includes(key);
};

const parse = (text: string) => {
  let cur = JSON.parse(JSON.stringify(INIT_PROPS));

  let breakCount = 0;
  let state: State = initState;

  const step = (char: string, i: number) => {
    if (char === '\n') {
      breakCount += 1;
    }
    let next = char;
    if (!(char in state)) {
      next = 'OTHERS';
    }
    if (!isStateKey(next)) {
      throw new Error(`Given character ${char} is not in the state key.`);
    }
    const { action, nextState } = state[next];
    cur = action(char, cur, i, breakCount, text); // Passing whole the text is memory consuming?
    if (nextState === DUMMY_STATE) {
      if (i < text.length - 1) {
        throw new Error('DUMMY_STATE.');
      }
    } else {
      state = nextState;
    }
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    step(char, i);
  }
  step(END, text.length - 1);

  return cur.sections;
};

export { parse };
