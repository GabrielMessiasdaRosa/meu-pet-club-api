import { Pet } from '@/domain/entities/pet.entity';
import { HateoasLink, HateoasResource } from './hateoas-resource.presenter';

export interface PetResponse {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  userId: string;
}

export class PetPresenter {
  static toResponse(pet: Pet): PetResponse {
    return {
      id: pet.Id,
      name: pet.Name,
      type: pet.Type,
      breed: pet.Breed,
      age: pet.Age,
      userId: pet.UserId,
    };
  }

  static toHateoas(pet: Pet): HateoasResource<PetResponse> {
    const response = this.toResponse(pet);

    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: `/api/v1/pets/${pet.Id}`,
        method: 'GET',
      },
      {
        rel: 'update',
        href: `/api/v1/pets/${pet.Id}`,
        method: 'PATCH',
      },
      {
        rel: 'delete',
        href: `/api/v1/pets/${pet.Id}`,
        method: 'DELETE',
      },
      {
        rel: 'owner',
        href: `/api/v1/users/${pet.UserId}`,
        method: 'GET',
      },
    ];

    return new HateoasResource<PetResponse>(response, links);
  }

  static toHateoasList(pets: Pet[]): HateoasResource<PetResponse[]> {
    const responses = pets.map((pet) => this.toResponse(pet));

    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/pets',
        method: 'GET',
      },
      {
        rel: 'create',
        href: '/api/v1/pets',
        method: 'POST',
      },
    ];

    return new HateoasResource<PetResponse[]>(responses, links);
  }

  static toHateoasMyPets(
    pets: Pet[],
    userId: string,
  ): HateoasResource<PetResponse[]> {
    const responses = pets.map((pet) => this.toResponse(pet));

    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: `/api/v1/pets/my-pets`,
        method: 'GET',
      },
      {
        rel: 'create',
        href: '/api/v1/pets',
        method: 'POST',
      },
      {
        rel: 'user',
        href: `/api/v1/users/${userId}`,
        method: 'GET',
      },
    ];

    return new HateoasResource<PetResponse[]>(responses, links);
  }
}
