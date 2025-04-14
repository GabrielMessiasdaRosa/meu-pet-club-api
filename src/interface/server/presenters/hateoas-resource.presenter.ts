/**
 * Interface para representar um link HATEOAS
 */
export interface HateoasLink {
  rel: string;
  href: string;
  method: string;
}

/**
 * Classe base para apresentação de recursos no formato HATEOAS
 */
export class HateoasResource<T> {
  data: T;
  links: HateoasLink[];

  constructor(data: T, links: HateoasLink[]) {
    this.data = data;
    this.links = links;
  }
}
