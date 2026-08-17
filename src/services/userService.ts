import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository';
import { accountRepository } from '../repositories/accountRepository';
import { AppError } from '../utils/AppError';
import { generateId } from '../utils/id';
import { isValidEmail, isNonEmptyString } from '../utils/validators';
import { CreateUserInput, PublicUser, UpdateUserInput, User, Account } from '../types';

const SALT_ROUNDS = 10;

function toPublicUser(user: User): PublicUser {
  const { password, ...publicUser } = user;
  return publicUser;
}

function validateCreateInput(input: CreateUserInput): void {
  if (!isNonEmptyString(input.name)) {
    throw AppError.badRequest('O campo "name" é obrigatório.');
  }
  if (!isNonEmptyString(input.email)) {
    throw AppError.badRequest('O campo "email" é obrigatório.');
  }
  if (!isValidEmail(input.email)) {
    throw AppError.badRequest('O campo "email" deve conter um e-mail válido.');
  }
  if (!isNonEmptyString(input.password)) {
    throw AppError.badRequest('O campo "password" é obrigatório.');
  }
}

export const userService = {
  async create(input: CreateUserInput): Promise<{ user: PublicUser; account: Account }> {
    validateCreateInput(input);

    const existing = userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('Já existe um usuário cadastrado com este e-mail.');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user: User = {
      id: generateId(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    userRepository.create(user);

    const account: Account = {
      id: generateId(),
      userId: user.id,
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    accountRepository.create(account);

    return { user: toPublicUser(user), account };
  },

  list(): PublicUser[] {
    return userRepository.findAll().map(toPublicUser);
  },

  getById(id: string): PublicUser {
    const user = userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('Usuário não encontrado.');
    }
    return toPublicUser(user);
  },

  async update(id: string, input: UpdateUserInput): Promise<PublicUser> {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Usuário não encontrado.');
    }

    const data: Partial<User> = {};

    if (input.name !== undefined) {
      if (!isNonEmptyString(input.name)) {
        throw AppError.badRequest('O campo "name" não pode ser vazio.');
      }
      data.name = input.name.trim();
    }

    if (input.email !== undefined) {
      if (!isValidEmail(input.email)) {
        throw AppError.badRequest('O campo "email" deve conter um e-mail válido.');
      }
      const emailOwner = userRepository.findByEmail(input.email);
      if (emailOwner && emailOwner.id !== id) {
        throw AppError.conflict('Já existe um usuário cadastrado com este e-mail.');
      }
      data.email = input.email.trim().toLowerCase();
    }

    if (input.password !== undefined) {
      if (!isNonEmptyString(input.password)) {
        throw AppError.badRequest('O campo "password" não pode ser vazio.');
      }
      data.password = await bcrypt.hash(input.password, SALT_ROUNDS);
    }

    const updated = userRepository.update(id, data);
    return toPublicUser(updated as User);
  },

  delete(id: string): void {
    const existing = userRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Usuário não encontrado.');
    }
    userRepository.delete(id);

    const account = accountRepository.findByUserId(id);
    if (account) {
      accountRepository.delete(account.id);
    }
  },
};
