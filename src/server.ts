import express from 'express';
import path from 'path';
import logger from './logger';
import guiRoutes from './gui/routes';

export const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Mount the GUI routes
app.use('/api', guiRoutes);

export function startServer(port = 3000): void {
    app.listen(port, () => {
        logger.info(`GUI Server running! Open http://localhost:${port} in your browser.`);
    });
}
