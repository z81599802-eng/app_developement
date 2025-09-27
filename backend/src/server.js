import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start the Express server.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
