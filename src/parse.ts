#!/usr/bin/env node

interface Shot {
  paragraphs: string[];
  music: string;
  sound: string;
  filter: string;
  bg: string;
  image: string;
  id: number;
}

interface Page {
  shots: Shot[];
  id: number;
}

interface CurrentProps {
  id: number;
  pageId: number;
  music: string;
  sound: string;
  bg: string;
  filter: string;
  image: string;
  paragraphs: string[];
  chars: string[];
  bracketKey: string;
  shots: Shot[];
  pages: Page[];
}

const END = 'END';
const OTHERS = 'OTHERS';
const PAGE = 'page';
const DEFAULT_BG = '';
const DEFAULT_MUSIC = '';
const DEFAULT_SOUND = '';
const DEFAULT_FILTER = '';
const DEFAULT_IMAGE = '';
const VALID_BRACKET_KEYS = ['bg', 'music', 'sound', 'image', 'filter'];

const errorAction: Action = ({ i, breakCount, text }: ActionInput) => {
  const spaces: string[] = [];
  for (let index = 0; index < i; index++) {
    spaces.push(' ');
  }
  const spaceString = spaces.join('');
  throw new Error(`Parse error. Text index: ${i}. Line number: ${breakCount + 1}.\n${text}\n${spaceString}^`);
};

const DUMMY_STATE = 'DUMMY_STATE';

interface Event {
  action: Action;
  nextState: State | typeof DUMMY_STATE;
}

const STATE_KEYS = ['[', ']', ' ', '\n', 'END', 'OTHERS'] as const;
type StateKey = typeof STATE_KEYS[number];

interface State {
  '[': Event;
  ']': Event;
  ' ': Event;
  '\n': Event;
  END: Event;
  OTHERS: Event;
}

interface ActionInput {
  char: string;
  cur: CurrentProps;
  i: number;
  breakCount: number;
  text: string;
}

type Action = (actionInput: ActionInput) => CurrentProps;

const ERROR_ACTION_STATE: Event = {
  action: errorAction,
  nextState: DUMMY_STATE,
};

const createInitProps = (): CurrentProps => ({
  id: 0,
  pageId: 0,
  music: DEFAULT_MUSIC,
  sound: DEFAULT_SOUND,
  bg: DEFAULT_BG,
  image: DEFAULT_IMAGE,
  filter: DEFAULT_FILTER,
  paragraphs: [],
  chars: [],
  shots: [],
  pages: [],
  bracketKey: '',
});

const noOpAction: Action = ({ cur }: ActionInput) => {
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

const pushCharAction: Action = ({ cur, char }: ActionInput) => {
  cur.chars.push(char);
  return cur;
};

initState.OTHERS.nextState = initState;
initState.OTHERS.action = pushCharAction;
initState[' '].nextState = initState;
initState[' '].action = pushCharAction;

// break action
initState['\n'].action = ({ cur }: ActionInput) => {
  const newParagraph = cur.chars.join('');
  cur.paragraphs.push(newParagraph);
  cur.chars = [];
  return cur;
};
initState['\n'].nextState = initState;

const endShotAction: Action = ({ cur }: ActionInput) => {
  const paragraph = cur.chars.join('');
  cur.chars = [];
  if (paragraph !== '') {
    cur.paragraphs.push(paragraph);
  }

  if (cur.paragraphs.length > 0) {
    cur.shots.push({
      paragraphs: cur.paragraphs,
      music: cur.music,
      sound: cur.sound,
      filter: cur.filter,
      bg: cur.bg,
      image: cur.image,
      id: cur.id,
    });
    cur.paragraphs = [];
    cur.sound = DEFAULT_SOUND;
    cur.image = DEFAULT_IMAGE;
    cur.id += 1;
  }
  return cur;
};

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

const endBracketAction: Action = ({ char, cur, i, breakCount, text }: ActionInput) => {
  const value = cur.chars.join('');
  cur.chars = [];
  const key = cur.bracketKey;
  if (!VALID_BRACKET_KEYS.includes(key)) {
    return errorAction({ char, cur, i, breakCount, text });
  }

  switch (key) {
    // e.g. [bg building] abcccdef [bg ocean] aewww
    case 'bg':
      cur.bg = value;
      break;
    case 'music':
      cur.music = value;
      break;
    case 'sound':
      cur.sound = value;
      break;
    case 'image':
      cur.image = value;
      break;
    case 'filter':
      cur.filter = value;
      break;
  }
  return cur;
};

// [bg  building ]
//              ^
const inBracketAfterValueState: State = {
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with keyDetermineAction and inBracketAfterSrcState
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with keyDetermineAction and inBracketAfterSrcState
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
  ' ': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with keyDetermineAction and inBracketAfterKeyState
  '\n': { action: noOpAction, nextState: DUMMY_STATE }, // To be replaced with keyDetermineAction and inBracketAfterKeyState
  '[': ERROR_ACTION_STATE,
  ']': ERROR_ACTION_STATE,
  END: ERROR_ACTION_STATE,
  OTHERS: { action: pushCharAction, nextState: inBracketValueState },
};
inBracketAfterKeyState[' '].nextState = inBracketAfterKeyState;
inBracketAfterKeyState['\n'].nextState = inBracketAfterKeyState;

const keyDetermineAction = ({ cur, char, i, breakCount, text }: ActionInput) => {
  const key = cur.chars.join('');
  cur.chars = [];
  if (!VALID_BRACKET_KEYS.includes(key)) {
    return errorAction({ char, cur, i, breakCount, text });
  }
  cur.bracketKey = key;
  return cur;
};

const singleKeywordTagEndAction: Action = ({ char, cur, i, breakCount, text }: ActionInput) => {
  if (cur.chars.join('') === PAGE) {
    cur.chars = [];
    cur.pages.push({ shots: cur.shots, id: cur.pageId });
    cur.pageId += 1;
    cur.shots = [];
    return cur;
  }
  return errorAction({ char, cur, i, breakCount, text });
};

const shotEndPageEndAction = ({ char, cur, i, breakCount, text }: ActionInput) => {
  const nextCur = endShotAction({ char, cur, i, breakCount, text });
  nextCur.pages.push({ shots: cur.shots, id: nextCur.pageId });
  nextCur.shots = [];
  nextCur.pageId += 1;
  return nextCur;
};

initState[END].action = shotEndPageEndAction;
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
initState['['].action = endShotAction;

afterEndBracketState['\n'].nextState = initState;
afterEndBracketState.OTHERS.action = pushCharAction;
afterEndBracketState.OTHERS.nextState = initState;
afterEndBracketState[' '].action = pushCharAction;
afterEndBracketState[' '].nextState = initState;
afterEndBracketState['['].nextState = inBracketBeforeKeyState;
afterEndBracketState.END.action = shotEndPageEndAction;

const isStateKey = (key: string): key is StateKey => {
  return (STATE_KEYS as readonly string[]).includes(key);
};

const parse = (text: string) => {
  let cur = createInitProps();

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
    cur = action({ char, cur, i, breakCount, text }); // Passing whole the text is memory consuming?
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

  return cur.pages;
};

export { parse };
