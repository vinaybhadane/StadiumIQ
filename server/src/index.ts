// Process entrypoint: start the HTTP server, seed baseline operations data,
// and run the crowd-telemetry simulator loop.
import { createServer } from './app.js';
import { SIMULATION_INTERVAL_MS } from './config/constants.js';
import { config } from './config/env.js';
import { progressSimulation, initializeData } from './features/operations/service.js';
import { appLog } from './lib/logger.js';

function launchCrowdSimulation(): void {
  if (!config.TELEMETRY_SIM_ENABLED) {
    appLog.info('Crowd simulation disabled in configuration');
    return;
  }
  setInterval(() => {
    progressSimulation().catch((error: unknown) => {
      appLog.warn({ err: error }, 'Simulation progress step failed');
    });
  }, SIMULATION_INTERVAL_MS);
}

const app = createServer();
app.listen(config.PORT, () => {
  appLog.info({ port: config.PORT, nodeEnv: config.NODE_ENV }, 'SmartStadium server listening');
});

// Seeding is best-effort at startup: if Firestore is briefly unreachable the
// assistant keeps working and operations endpoints report their own errors.
initializeData()
  .then(() => {
    launchCrowdSimulation();
  })
  .catch((error: unknown) => {
    appLog.warn({ err: error }, 'Initial seeding failed; dashboard details might be unavailable');
    launchCrowdSimulation();
  });
