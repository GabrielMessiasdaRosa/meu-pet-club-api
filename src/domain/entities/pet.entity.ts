import { randomUUID } from 'crypto';

export class Pet {
  private readonly id: string;
  private name: string;
  private type: string;
  private breed?: string;
  private age?: number;
  private userId: string;

  constructor(petData: {
    id?: string;
    name: string;
    type: string;
    breed?: string;
    age?: number;
    userId: string;
  }) {
    this.id = petData.id ?? randomUUID();
    this.name = petData.name;
    this.type = petData.type;
    this.breed = petData.breed;
    this.age = petData.age;
    this.userId = petData.userId;
    this.validate();
  }

  private validate() {
    if (!this.name) {
      throw new Error('Nome do pet é obrigatório');
    }

    if (!this.type) {
      throw new Error('Tipo do pet é obrigatório');
    }

    if (!this.userId) {
      throw new Error('ID do usuário é obrigatório');
    }
  }

  get Id(): string {
    return this.id;
  }

  get Name(): string {
    return this.name;
  }

  get Type(): string {
    return this.type;
  }

  get Breed(): string | undefined {
    return this.breed;
  }

  get Age(): number | undefined {
    return this.age;
  }

  get UserId(): string {
    return this.userId;
  }

  public setName(name: string): void {
    if (!name) {
      throw new Error('Nome do pet é obrigatório');
    }
    this.name = name;
  }

  public setType(type: string): void {
    if (!type) {
      throw new Error('Tipo do pet é obrigatório');
    }
    this.type = type;
  }

  public setBreed(breed?: string): void {
    this.breed = breed;
  }

  public setAge(age?: number): void {
    this.age = age;
  }
}
