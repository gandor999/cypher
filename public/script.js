import { getUIElements } from './utils/dom.js';
import { UI_SELECTORS } from './constants/index.js';
import { setupAutomationButton } from './handlers/button.js';
import { setupStatusIndicator } from './handlers/status.js';

document.addEventListener('DOMContentLoaded', () => {
    const ui = getUIElements({
        startBtn: UI_SELECTORS.START_BTN,
        statusDot: UI_SELECTORS.STATUS_DOT,
        statusText: UI_SELECTORS.STATUS_TEXT,
        btnText: UI_SELECTORS.BTN_TEXT
    });

    const state = { isRunning: false };

    setupStatusIndicator(ui);
    setupAutomationButton(state, ui);
});
