import express, { type Request, type Response } from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// MUST be before any routes
app.use(express.json());

interface ApplyRequestBody {
  projectId?: number;
}

app.post('/api/apply', (req: Request<{}, {}, ApplyRequestBody>, res: Response) => {
  const { projectId } = req.body ?? {};

  if (!projectId) {
    res.status(400).json({ success: false, message: 'projectId is required' });
    return;
  }

  console.log('Received application for project:', projectId);
  res.json({ success: true, message: 'Application received!' });
});

app.use(express.static(path.join(process.cwd(), '../client/dist')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
