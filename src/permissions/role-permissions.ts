import { Permission } from './permissions';
import { Role } from './role';

// Permisiunile implicite pentru fiecare rol
export const PERMISSIONS_BY_ROLE: Record<Role, Permission[]> = {
    [Role.ADMIN]: Object.values(Permission), // Admin are toate permisiunile
    
    [Role.MANAGER]: [
        Permission.VIEW_USERS,
        Permission.VIEW_EMPLOYEES,
        Permission.CREATE_EMPLOYEE,
        Permission.EDIT_EMPLOYEE,
        Permission.VIEW_CLIENTS,
        Permission.CREATE_CLIENT,
        Permission.EDIT_CLIENT,
    ],
    
    [Role.EMPLOYEE]: [
        Permission.VIEW_CLIENTS,
        Permission.CREATE_CLIENT,
        Permission.EDIT_CLIENT,
    ],
    
    [Role.CLIENT]: [
        // Clientii nu au permisiuni administrative
    ],
};

export function getPermissionsForRole(role: Role): Permission[] {
    return PERMISSIONS_BY_ROLE[role] || [];
}