export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'password'>;

export interface Account {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  relatedAccountId?: string;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
}

export interface DepositInput {
  amount: number;
}

export interface WithdrawInput {
  amount: number;
}

export interface TransferInput {
  toAccountId: string;
  amount: number;
}
