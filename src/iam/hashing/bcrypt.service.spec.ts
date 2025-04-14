import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { BcryptService } from './bcrypt.service';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('deve gerar um hash da senha corretamente', async () => {
      const senha = 'senha123';
      const salt = 'salt_gerado';
      const hashResultado = 'senha_criptografada';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashResultado);

      const resultado = await service.hash(senha);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(senha, salt);
      expect(resultado).toBe(hashResultado);
    });
  });

  describe('compare', () => {
    it('deve comparar senha com hash corretamente', async () => {
      const senha = 'senha123';
      const hash = 'hash_senha';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const resultado = await service.compare(senha, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(senha, hash);
      expect(resultado).toBe(true);
    });

    it('deve retornar false quando a senha não corresponder', async () => {
      const senha = 'senha_errada';
      const hash = 'hash_senha';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const resultado = await service.compare(senha, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(senha, hash);
      expect(resultado).toBe(false);
    });
  });
});
