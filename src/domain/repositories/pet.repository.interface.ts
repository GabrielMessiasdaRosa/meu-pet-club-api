import { Pet } from '../entities/pet.entity';

export interface IPetRepository {
  findAll(): Promise<Pet[]>;
  findById(id: string): Promise<Pet | null>;
  findByUserId(userId: string): Promise<Pet[]>;
  create(petData: Pet): Promise<Pet>;
  update(id: string, petData: Partial<Pet>): Promise<Pet>;
  delete(id: string): Promise<void>;
}
