export const UI_SELECTORS = {
    START_BTN: '#startBtn',
    STATUS_DOT: '#statusDot',
    STATUS_TEXT: '#statusText',
    BTN_TEXT: '#btnText',
    INSPECT_BTN: '#inspectBtn'
};

export const UI_MESSAGES = {
    READY: 'System Ready',
    LAUNCHING: 'Chrome is launching...',
    CONNECTED: 'Connected to Host URL',
    START_BTN: 'Start Automation',
    CANCEL_BTN: 'Cancel Automation',
    CANCELLING: 'Cancelling...',
    ERROR_CANCEL: 'Error cancelling',
    ERROR_CONNECTION: 'Error: Connection failed'
};

export const API_ENDPOINTS = {
    START: '/api/start-automation',
    CANCEL: '/api/cancel-automation'
};

export const INSPECT_FAILED_TEXT = 'Failed';
export const INSPECT_DEFAULT_TEXT = 'Extract DOM';

export const THEME_COLORS = {
    SUCCESS: '#4ade80',
    ERROR: '#f87171'
};
