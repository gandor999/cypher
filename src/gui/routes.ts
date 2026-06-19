import { Router } from 'express';
import { launchAndNavigate, cancelAutomation } from '../browser';
import { TARGET_URL } from '../constants';
import logger from '../logger';

const router = Router();

router.post('/start-automation', async (req, res) => {
    logger.info('Received request to start automation from GUI.');
    try {
        // Respond immediately so UI doesn't hang
        res.json({ success: true, message: 'Automation starting...' });

        // Run the automation asynchronously
        await launchAndNavigate(TARGET_URL);
        logger.info('Automation completed successfully.');
    } catch (error) {
        logger.error(error);
    }
});

router.post('/cancel-automation', async (req, res) => {
    logger.info('Received request to cancel automation from GUI.');
    try {
        await cancelAutomation();
        res.json({ success: true, message: 'Automation cancelled.' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: 'Failed to cancel.' });
    }
});

export default router;
