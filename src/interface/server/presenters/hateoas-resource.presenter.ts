/**
 * Interface para representar um link HATEOAS
 */
interface Link {
  href: string;
  rel: string;
  method: string;
}

/**
 * Classe base para apresentação de recursos no formato HATEOAS
 */
export class HateoasResource<T> {
  data: T;
  links: Link[];

  constructor(data: T, links: Link[]) {
    this.data = data;
    this.links = links;
  }
}
