import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Health check', () => {
  it('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Usuários', () => {
  it('cria um usuário e a conta associada, sem retornar a senha', async () => {
    const res = await request(app).post('/users').send({
      name: 'Carla Souza',
      email: 'carla@example.com',
      password: 'senha123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.account.balance).toBe(0);
  });

  it('rejeita e-mail duplicado com 409', async () => {
    await request(app).post('/users').send({
      name: 'Duplicado',
      email: 'duplicado@example.com',
      password: 'senha123',
    });

    const res = await request(app).post('/users').send({
      name: 'Duplicado 2',
      email: 'duplicado@example.com',
      password: 'senha123',
    });

    expect(res.status).toBe(409);
  });

  it('rejeita criação sem campos obrigatórios com 400', async () => {
    const res = await request(app).post('/users').send({ email: 'sem-nome@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('Operações financeiras', () => {
  async function createAccount(email: string) {
    const res = await request(app).post('/users').send({
      name: 'Usuário Teste',
      email,
      password: 'senha123',
    });
    return res.body.account.id as string;
  }

  it('realiza um depósito corretamente', async () => {
    const accountId = await createAccount('deposito@example.com');

    const res = await request(app).post(`/accounts/${accountId}/deposit`).send({ amount: 150 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(150);
  });

  it('realiza um saque corretamente', async () => {
    const accountId = await createAccount('saque@example.com');
    await request(app).post(`/accounts/${accountId}/deposit`).send({ amount: 100 });

    const res = await request(app).post(`/accounts/${accountId}/withdraw`).send({ amount: 40 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(60);
  });

  it('impede saque sem saldo suficiente', async () => {
    const accountId = await createAccount('sem-saldo@example.com');

    const res = await request(app).post(`/accounts/${accountId}/withdraw`).send({ amount: 50 });

    expect(res.status).toBe(400);
  });

  it('realiza uma transferência corretamente entre duas contas', async () => {
    const fromId = await createAccount('origem@example.com');
    const toId = await createAccount('destino@example.com');
    await request(app).post(`/accounts/${fromId}/deposit`).send({ amount: 300 });

    const res = await request(app).post(`/accounts/${fromId}/transfer`).send({
      toAccountId: toId,
      amount: 120,
    });

    expect(res.status).toBe(200);
    expect(res.body.from.balance).toBe(180);
    expect(res.body.to.balance).toBe(120);
  });

  it('impede transferência para conta inexistente', async () => {
    const fromId = await createAccount('origem2@example.com');
    await request(app).post(`/accounts/${fromId}/deposit`).send({ amount: 100 });

    const res = await request(app).post(`/accounts/${fromId}/transfer`).send({
      toAccountId: 'conta-inexistente',
      amount: 50,
    });

    expect(res.status).toBe(404);
  });

  it('impede transferência com valor inválido', async () => {
    const fromId = await createAccount('origem3@example.com');
    const toId = await createAccount('destino3@example.com');

    const res = await request(app).post(`/accounts/${fromId}/transfer`).send({
      toAccountId: toId,
      amount: -10,
    });

    expect(res.status).toBe(400);
  });
});
