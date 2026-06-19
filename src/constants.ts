import path from 'path';

export const CHROME_PATHS: string[] = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];

export const TARGET_URL = 'https://www.heygotrade.comqwd';
