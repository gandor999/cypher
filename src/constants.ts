import path from 'path';

export const CHROME_PATHS: string[] = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];

import dotenv from 'dotenv';
dotenv.config();

export const TARGET_URL = process.env.TARGET_URL || 'https://www.google.com';
export const STEPS_FILE_PATH = process.env.STEPS_FILE_PATH || path.join(process.cwd(), 'steps', 'steps.json');

export const LOG_MESSAGES = {
    AUTOMATION_COMPLETE: 'Automation sequence complete. Closing browser automatically...',
    BROWSER_RUNNING: 'Browser is already running.',
    TARGET_URL: (url: string) => `Target URL: ${url}`,
    FOUND_CHROME: (path: string) => `Found local Google Chrome at: ${path}`,
    FALLBACK_CHROME: "Local Google Chrome not found in standard paths. Falling back to Puppeteer's bundled browser.",
    LAUNCHING_BROWSER: 'Launching browser...',
    BROWSER_DISCONNECTED: 'Browser disconnected or closed.',
    CANCELLING_BROWSER: 'Cancelling automation: closing browser...',
    NO_ACTIVE_BROWSER: 'No active browser to cancel.',
    SIGINT_RECEIVED: 'Received SIGINT (Ctrl+C). Cleaning up...',
    SIGTERM_RECEIVED: 'Received SIGTERM. Cleaning up...',
    LOOKING_FOR_ELEMENT: (descriptor: string, index: number) =>
        `Looking for element "${descriptor}" (index ${index})...`,
    CLICKED_ELEMENT: (descriptor: string) => `Successfully clicked element "${descriptor}".`,
    TYPING_REDACTED: 'Typing [REDACTED] into input element in active tab...',
    REQ_START_AUTOMATION: 'Received request to start automation from GUI.',
    SUCCESS_AUTOMATION: 'Automation completed successfully.',
    REQ_CANCEL_AUTOMATION: 'Received request to cancel automation from GUI.',
    REQ_EXTRACT_AST: 'Received request to extract JSON AST from live page.',
    AST_WRITTEN: 'Live JSON AST written to logs/inspect.json',
    SERVER_RUNNING: (port: number) => `GUI Server running! Open http://localhost:${port} in your browser.`
};
