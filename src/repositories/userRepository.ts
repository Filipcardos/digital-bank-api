import { User } from '../types';

/**
 * Repositório em memória para usuários.
 *
 * Mantido isolado atrás desta interface simples para que, no futuro,
 * a implementação possa ser trocada por um banco de dados real
 * (Postgres, MongoDB, etc.) sem impactar services/controllers.
 */
class UserRepository {
  private users: Map<string, User> = new Map();

  create(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  findByEmail(email: string): User | undefined {
    return this.findAll().find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  update(id: string, data: Partial<User>): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const updated: User = { ...existing, ...data, id: existing.id };
    this.users.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }
}

export const userRepository = new UserRepository();
