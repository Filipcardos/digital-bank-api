import { accountRepository } from '../repositories/accountRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { AppError } from '../utils/AppError';
import { generateId } from '../utils/id';
import { isPositiveNumber } from '../utils/validators';
import { Account, Transaction } from '../types';

function getAccountOrThrow(id: string): Account {
  const account = accountRepository.findById(id);
  if (!account) {
    throw AppError.notFound('Conta não encontrada.');
  }
  return account;
}

function validateAmount(amount: unknown): void {
  if (!isPositiveNumber(amount)) {
    throw AppError.badRequest('O campo "amount" deve ser um número maior que zero.');
  }
}

function recordTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transaction: Transaction = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  return transactionRepository.create(transaction);
}

export const accountService = {
  getById(id: string): Account {
    return getAccountOrThrow(id);
  },

  getBalance(id: string): { accountId: string; balance: number } {
    const account = getAccountOrThrow(id);
    return { accountId: account.id, balance: account.balance };
  },

  deposit(id: string, amount: number): Account {
    validateAmount(amount);
    const account = getAccountOrThrow(id);

    const updated = accountRepository.updateBalance(id, account.balance + amount) as Account;
    recordTransaction({ accountId: id, type: 'DEPOSIT', amount });

    return updated;
  },

  withdraw(id: string, amount: number): Account {
    validateAmount(amount);
    const account = getAccountOrThrow(id);

    if (account.balance < amount) {
      throw AppError.badRequest('Saldo insuficiente para realizar o saque.');
    }

    const updated = accountRepository.updateBalance(id, account.balance - amount) as Account;
    recordTransaction({ accountId: id, type: 'WITHDRAW', amount });

    return updated;
  },

  transfer(fromId: string, toAccountId: string, amount: number): { from: Account; to: Account } {
    validateAmount(amount);

    if (!toAccountId) {
      throw AppError.badRequest('O campo "toAccountId" é obrigatório.');
    }

    if (fromId === toAccountId) {
      throw AppError.badRequest('A conta de origem deve ser diferente da conta de destino.');
    }

    const fromAccount = getAccountOrThrow(fromId);
    const toAccount = getAccountOrThrow(toAccountId);

    if (fromAccount.balance < amount) {
      throw AppError.badRequest('Saldo insuficiente para realizar a transferência.');
    }

    const updatedFrom = accountRepository.updateBalance(fromId, fromAccount.balance - amount) as Account;
    const updatedTo = accountRepository.updateBalance(toAccountId, toAccount.balance + amount) as Account;

    recordTransaction({ accountId: fromId, type: 'TRANSFER_OUT', amount, relatedAccountId: toAccountId });
    recordTransaction({ accountId: toAccountId, type: 'TRANSFER_IN', amount, relatedAccountId: fromId });

    return { from: updatedFrom, to: updatedTo };
  },

  listTransactions(accountId: string): Transaction[] {
    getAccountOrThrow(accountId);
    return transactionRepository.findByAccountId(accountId);
  },
};
