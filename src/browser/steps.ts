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

        if (step.element.type === 'WaitElement' && elInstance.id === 'waitFlag') {
            logger.info('Automation paused. Waiting for a tab to be closed...');
            const browser = page.browser();
            let initialPagesCount = (await browser.pages()).length;

            while (true) {
                const currentPagesCount = (await browser.pages()).length;
                if (currentPagesCount < initialPagesCount) {
                    break;
                }
                // If the user hasn't opened the popup yet, or opens a new tab, adjust the baseline
                if (currentPagesCount > initialPagesCount) {
                    initialPagesCount = currentPagesCount;
                }
                await new Promise((r) => setTimeout(r, 500));
            }
            logger.info('Tab closed. Resuming automation...');
            continue;
        }

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
                        const isWait = step.element.type === 'WaitElement';
                        if (isWait && retry === 0) {
                            logger.info(
                                `Automation paused. Waiting for you to manually interact with "${descriptor}"...`
                            );
                        }

                        // Ignore cross-origin frame execution errors, proceed to next frame
                        const result = await frame.evaluate(
                            (queryText, stepIndex, selectorStr, elementType) => {
                                const els = Array.from(document.querySelectorAll(selectorStr));
                                const matches = els.filter((el) => {
                                    if (queryText) {
                                        const elAny = el as any;
                                        const text = (
                                            elAny.innerText ||
                                            elAny.textContent ||
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

                                // CRITICAL FIX: Filter out parent containers.
                                // If a node matches, but it contains a child that ALSO matches,
                                // we only want the deeply-nested child (the actual button).
                                const leafMatches = matches.filter((el) => {
                                    return !matches.some((child) => child !== el && el.contains(child));
                                });

                                const targetBtn = leafMatches[stepIndex] || matches[stepIndex];
                                if (targetBtn) {
                                    if (elementType === 'WaitElement') {
                                        // Wait for the user to manually click it
                                        return new Promise<any>((resolve) => {
                                            targetBtn.addEventListener(
                                                'click',
                                                () => {
                                                    resolve({ clicked: true });
                                                },
                                                { once: true }
                                            );
                                        });
                                    } else {
                                        (targetBtn as HTMLElement).focus();
                                        (targetBtn as HTMLElement).click();
                                        return { clicked: true };
                                    }
                                }
                                return null;
                            },
                            elInstance.text,
                            step.index,
                            selector,
                            step.element.type
                        );

                        if (result) {
                            activePage = p; // We found the element in this specific page/tab
                            clicked = true;
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
