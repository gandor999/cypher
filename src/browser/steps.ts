import fs from 'fs';
import { Page } from 'puppeteer';
import { STEPS_FILE_PATH } from '../constants';
import logger from '../logger';
import { ElementFactory } from '../classes/elements';
import { IClickStep } from '../interfaces/elements';

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

        logger.info(`Looking for element "${descriptor}" (index ${step.index})...`);
        await page.waitForSelector(selector, { timeout: 10000 });

        /* istanbul ignore next */
        const clicked = await page.evaluate(
            (queryText, stepIndex, selectorStr) => {
                const els = Array.from(document.querySelectorAll(selectorStr));
                const matches = els.filter((el) => {
                    if (queryText) {
                        const elAny = el as any;
                        const text = (elAny.innerText || elAny.value || elAny.placeholder || '')
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
            logger.info(`Successfully clicked element "${descriptor}".`);
            // Wait briefly for any UI transitions or network requests to initiate
            await new Promise((r) => setTimeout(r, 2000));
        } else {
            logger.warn(`Could not find element matching criteria "${descriptor}" at index ${step.index}.`);
        }
    }
}
