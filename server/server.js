import app, { initializeApp } from './app.js';
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await initializeApp();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Server running test commit");
  });
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});

export default app;
