import { SetMetadata } from '@nestjs/common';
import { Role } from '../permissions/role'; // adaptează calea dacă e diferită

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
