import { INSPECT_FAILED_TEXT, INSPECT_DEFAULT_TEXT, THEME_COLORS } from '../constants/index.js';

export function setupInspectButton(ui) {
    if (!ui.inspectBtn) return;

    ui.inspectBtn.addEventListener('click', async () => {
        ui.inspectBtn.style.opacity = '0.7';
        ui.inspectBtn.disabled = true;

        try {
            const response = await fetch('/api/inspect');
            const data = await response.json();
            if (!data.success) {
                ui.inspectBtn.textContent = INSPECT_FAILED_TEXT;
                ui.inspectBtn.style.color = THEME_COLORS.ERROR;
                ui.inspectBtn.style.borderColor = THEME_COLORS.ERROR;
            }
        } catch (error) {
            console.error('Inspection failed:', error);
            ui.inspectBtn.textContent = INSPECT_FAILED_TEXT;
            ui.inspectBtn.style.color = THEME_COLORS.ERROR;
            ui.inspectBtn.style.borderColor = THEME_COLORS.ERROR;
        } finally {
            setTimeout(() => {
                ui.inspectBtn.textContent = INSPECT_DEFAULT_TEXT;
                ui.inspectBtn.style.color = THEME_COLORS.SUCCESS;
                ui.inspectBtn.style.borderColor = THEME_COLORS.SUCCESS;
                ui.inspectBtn.style.opacity = '1';
                ui.inspectBtn.disabled = false;
            }, 3000);
        }
    });
}
