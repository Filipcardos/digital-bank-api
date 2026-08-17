import { Transaction } from '../types';

class TransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  create(transaction: Transaction): Transaction {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  findByAccountId(accountId: string): Transaction[] {
    return Array.from(this.transactions.values())
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

export const transactionRepository = new TransactionRepository();
