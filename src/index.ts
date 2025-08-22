import express from 'express';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get('/', (_req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
