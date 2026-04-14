import serverless from 'serverless-http';
import app, { initializeApp } from '../../app.js';

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  if (context && 'callbackWaitsForEmptyEventLoop' in context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  await initializeApp();
  return serverlessHandler(event, context);
};
