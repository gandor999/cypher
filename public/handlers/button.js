import { UI_MESSAGES, API_ENDPOINTS } from '../constants/index.js';

export async function handleStartAutomation(apiUrl, state, ui) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success && state.isRunning) {
            setTimeout(() => {
                if (state.isRunning) ui.statusText.textContent = UI_MESSAGES.CONNECTED;
            }, 3000);
        }
    } catch (error) {
        state.isRunning = false;
        ui.startBtn.classList.remove('running');
        ui.btnText.textContent = UI_MESSAGES.START_BTN;
        ui.statusText.textContent = UI_MESSAGES.ERROR_CONNECTION;
        ui.statusDot.classList.remove('running');
        ui.statusDot.style.backgroundColor = '#ef4444';
        ui.statusDot.style.boxShadow = '0 0 10px #ef4444';
    }
}

export async function handleCancelAutomation(apiUrl, state, ui) {
    try {
        await fetch(apiUrl, { method: 'POST' });
        state.isRunning = false;
        ui.startBtn.classList.remove('running');
        ui.btnText.textContent = UI_MESSAGES.START_BTN;
        ui.statusDot.classList.remove('running');
        ui.statusDot.classList.add('ready');
        ui.statusText.textContent = UI_MESSAGES.READY;
    } catch (error) {
        ui.statusText.textContent = UI_MESSAGES.ERROR_CANCEL;
    }
}

export function setupAutomationButton(state, ui) {
    ui.startBtn.addEventListener('click', async () => {
        if (state.isRunning) {
            ui.btnText.textContent = UI_MESSAGES.CANCELLING;
            await handleCancelAutomation(API_ENDPOINTS.CANCEL, state, ui);
            return;
        }

        state.isRunning = true;
        ui.startBtn.classList.add('running');
        ui.btnText.textContent = UI_MESSAGES.CANCEL_BTN;
        ui.statusDot.classList.remove('ready');
        ui.statusDot.classList.add('running');
        ui.statusText.textContent = UI_MESSAGES.LAUNCHING;

        await handleStartAutomation(API_ENDPOINTS.START, state, ui);
    });
}
