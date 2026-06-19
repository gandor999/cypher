import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { launchAndNavigate, cancelAutomation } from '../browser';
import { getActiveBrowser } from '../browser/launcher';
import { getLivePageJsonAST } from '../browser/util';
import { TARGET_URL, LOG_MESSAGES } from '../constants';
import logger from '../logger';

const router = Router();

router.post('/start-automation', async (req, res) => {
    logger.info(LOG_MESSAGES.REQ_START_AUTOMATION);
    try {
        // Respond immediately so UI doesn't hang
        res.json({ success: true, message: 'Automation starting...' });

        // Run the automation asynchronously
        launchAndNavigate(TARGET_URL)
            .then(() => logger.info(LOG_MESSAGES.SUCCESS_AUTOMATION))
            .catch((error) => logger.error(error));
    } catch (error) {
        logger.error(error);
    }
});

router.post('/cancel-automation', async (req, res) => {
    logger.info(LOG_MESSAGES.REQ_CANCEL_AUTOMATION);
    try {
        await cancelAutomation();
        res.json({ success: true, message: 'Automation cancelled.' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Failed to cancel.' });
    }
});

router.get('/inspect', async (req, res) => {
    logger.info(LOG_MESSAGES.REQ_EXTRACT_AST);
    try {
        const ast = await getLivePageJsonAST(getActiveBrowser());
        
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        const logFile = path.join(logsDir, 'inspect.json');

        fs.writeFileSync(logFile, JSON.stringify(ast, null, 4), 'utf-8');
        logger.info(LOG_MESSAGES.AST_WRITTEN);
        
        res.json({ success: true });
    } catch (error: any) {
        logger.error(`Inspect failed: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
