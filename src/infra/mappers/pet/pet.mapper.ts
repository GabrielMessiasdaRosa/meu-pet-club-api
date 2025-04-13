import { Pet } from '@/domain/entities/pet.entity';
import { PetSchema } from '@/infra/database/mongodb/schemas/pet.schema';

export class PetMapper {
  static toDomain(schema: PetSchema): Pet {
    const domain = new Pet({
      id: schema._id,
      name: schema.name,
      type: schema.type,
      breed: schema.breed,
      age: schema.age,
      userId: schema.userId,
    });

    return domain;
  }

  static toPersistence(domain: Pet): PetSchema {
    const schema = new PetSchema();
    schema._id = domain.Id;
    schema.name = domain.Name;
    schema.type = domain.Type;
    schema.breed = domain.Breed;
    schema.age = domain.Age;
    schema.userId = domain.UserId;
    return schema;
  }
}
