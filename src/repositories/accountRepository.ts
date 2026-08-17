import { Account } from '../types';

class AccountRepository {
  private accounts: Map<string, Account> = new Map();

  create(account: Account): Account {
    this.accounts.set(account.id, account);
    return account;
  }

  findAll(): Account[] {
    return Array.from(this.accounts.values());
  }

  findById(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  findByUserId(userId: string): Account | undefined {
    return this.findAll().find((account) => account.userId === userId);
  }

  updateBalance(id: string, balance: number): Account | undefined {
    const existing = this.accounts.get(id);
    if (!existing) return undefined;

    const updated: Account = { ...existing, balance };
    this.accounts.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.accounts.delete(id);
  }
}

export const accountRepository = new AccountRepository();
