import { app } from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`🏦 DIO Bank API rodando em http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
