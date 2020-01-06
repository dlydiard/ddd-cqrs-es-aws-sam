import uuid = require('uuid');

import { Role } from './role';

const id = uuid();

describe('Role Create', () => {
  test("it should only except valid names", () => {
    expect(() => Role.create(id, 'invalid name 123')).toThrow();
    expect(Role.create(id, 'Admin')).toEqual(expect.objectContaining({
      name: 'Admin'
    }));
  });
});

describe('Role Disable', () => {
  test("it should only allow state change", () => {
    expect((() => {
      const role = new Role(id);
      role.disable(id);
      role.disable(id);
      return role;
    })).toThrow();

    expect((() => {
      const role = new Role(id);
      role.disable(id);
      return role;
    })()).toEqual(expect.objectContaining({
      disabled: true
    }));
  });
});
