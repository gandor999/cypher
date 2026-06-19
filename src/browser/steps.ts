import fs from 'fs';
import { Page } from 'puppeteer';
import { STEPS_FILE_PATH } from '../constants';
import logger from '../logger';
import { ElementFactory } from '../classes/elements';
import { IClickStep } from '../interfaces/elements';
import { LOG_MESSAGES } from '../constants';

export function getSteps(stepsPath: string = STEPS_FILE_PATH): IClickStep[] {
    try {
        if (fs.existsSync(stepsPath)) {
            const content = fs.readFileSync(stepsPath, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e: any) {
        logger.warn(`Failed to parse steps configuration, using fallback. Error: ${e.message}`);
    }
    return [];
}

export async function executeSteps(page: Page, finalSteps: IClickStep[]): Promise<void> {
    for (const step of finalSteps) {
        const elInstance = ElementFactory.create(step.element.type, step.element.metadata);
        const descriptor = elInstance.text || elInstance.id || elInstance.cssClass || step.element.type;

        const selector = elInstance.getSelector();

        logger.info(LOG_MESSAGES.LOOKING_FOR_ELEMENT(descriptor, step.index));

        // Wait briefly for the DOM or frames to settle before searching
        await new Promise((r) => setTimeout(r, 1000));

        let clicked = false;
        let activePage = page; // Keep track of which tab the element was found in
        const maxRetries = 30; // 30 * 500ms = 15 seconds

        for (let retry = 0; retry < maxRetries; retry++) {
            const pages = await page.browser().pages();

            for (const p of pages) {
                const frames = p.frames();

                for (const frame of frames) {
                    try {
                        // Ignore cross-origin frame execution errors, proceed to next frame
                        clicked = await frame.evaluate(
                            (queryText, stepIndex, selectorStr) => {
                                const els = Array.from(document.querySelectorAll(selectorStr));
                                const matches = els.filter((el) => {
                                    if (queryText) {
                                        const elAny = el as any;
                                        const text = (
                                            elAny.innerText ||
                                            elAny.value ||
                                            elAny.placeholder ||
                                            el.getAttribute('aria-label') ||
                                            ''
                                        )
                                            .replace(/\n/g, ' ')
                                            .trim();
                                        if (!text.includes(queryText)) {
                                            return false;
                                        }
                                    }
                                    return true;
                                });

                                const targetBtn = matches[stepIndex];
                                if (targetBtn) {
                                    (targetBtn as HTMLElement).focus();
                                    (targetBtn as HTMLElement).click();
                                    return true;
                                }
                                return false;
                            },
                            elInstance.text,
                            step.index,
                            selector
                        );

                        if (clicked) {
                            activePage = p; // We found the element in this specific page/tab
                            break; // Stop searching frames
                        }
                    } catch (e) {
                        continue;
                    }
                }
                if (clicked) break; // Stop searching pages
            }

            if (clicked) {
                break; // Break out of retry loop
            }

            // Wait 500ms before checking again
            await new Promise((r) => setTimeout(r, 500));
        }

        if (clicked) {
            logger.info(LOG_MESSAGES.CLICKED_ELEMENT(descriptor));

            if (step.element.type === 'InputElement') {
                const inputValue = (elInstance as any).value || '';
                logger.info(LOG_MESSAGES.TYPING_REDACTED);
                // Wait briefly for focus to settle
                await new Promise((r) => setTimeout(r, 200));
                // Make sure we bring the popup page to front so keyboard events work natively
                await activePage.bringToFront();
                await activePage.keyboard.type(inputValue, { delay: 50 });
            }

            // Wait briefly for any UI transitions or network requests to initiate
            await new Promise((r) => setTimeout(r, 2000));
        } else {
            logger.warn(`Could not find element matching criteria "${descriptor}" at index ${step.index}.`);
        }
    }
}
