import { startServer } from './server';
import logger from './logger';

try {
    startServer(3000);
} catch (error) {
    logger.error(error);
}
