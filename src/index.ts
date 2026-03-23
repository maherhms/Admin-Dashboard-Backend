import express, { Request, Response } from 'express';

const app = express();
const port = 8000;

// JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Admin Dashboard API!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
