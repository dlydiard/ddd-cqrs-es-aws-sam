import uuid = require('uuid');

import { User } from './user';

const id = uuid();

describe('User Register', () => {
  test("it should only except valid emails", () => {
    expect(() => User.register(id, 'invalid.email.com')).toThrow();
    expect(User.register(id, 'valid@email.com')).toEqual(expect.objectContaining({
      email: 'valid@email.com'
    }));
  });
});

describe('User Update', () => {
  test("it should only except valid names", () => {
    expect((() => {
      const user = new User(id);
      user.update(id, 'first123', 'last123');
      return user;
    })).toThrow();

    expect((() => {
      const user = new User(id);
      user.update(id, 'first', 'last');
      return user;
    })()).toEqual(expect.objectContaining({
      firstName: 'first',
      lastName: 'last'
    }));
  });
});

describe('User Disable', () => {
  test("it should only allow state change", () => {
    expect((() => {
      const user = new User(id);
      user.disable(id);
      user.disable(id);
      return user;
    })).toThrow();

    expect((() => {
      const user = new User(id);
      user.disable(id);
      return user;
    })()).toEqual(expect.objectContaining({
      disabled: true
    }));
  });
});
