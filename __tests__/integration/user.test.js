import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import truncate from '../util/truncate';
import factory from '../factories';

describe('user', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('hash da senha do usuario', async () => {
    const { password_hash } = await factory.create('User', {
      password: '123456',
    });
    const compareHash = await bcrypt.compare('123456', password_hash);
    expect(compareHash).toBe(true);
  });

  it('criacao de usuario provider', async () => {
    const response = await request(app)
      .post('/users')
      .send(await factory.attrs('User'));
    expect(response.body).toHaveProperty('id');
  });
});
