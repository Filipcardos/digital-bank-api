import { app } from '../src/app';

// A Vercel invoca este handler para cada requisição.
// Nenhum app.listen() é chamado aqui: o Express app é usado
// diretamente como request handler (req, res), compatível com
// o modelo de execução serverless da Vercel.
export default app;
