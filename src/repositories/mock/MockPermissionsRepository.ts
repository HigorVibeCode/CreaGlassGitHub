import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsRepository } from '../../services/repositories/interfaces';
import { Permission } from '../../types';

const STORAGE_KEY_PERMISSIONS = 'mock_permissions';
const STORAGE_KEY_USER_PERMISSIONS = 'mock_user_permissions';

// Default permissions
const DEFAULT_PERMISSIONS: Omit<Permission, 'id' | 'createdAt'>[] = [
  { key: 'documents.upload', descriptionI18nKey: 'permissions.documents.upload' },
  { key: 'documents.view', descriptionI18nKey: 'permissions.documents.view' },
  { key: 'documents.download', descriptionI18nKey: 'permissions.documents.download' },
  { key: 'inventory.group.create', descriptionI18nKey: 'permissions.inventory.group.create' },
  { key: 'inventory.item.create', descriptionI18nKey: 'permissions.inventory.item.create' },
  { key: 'inventory.item.update', descriptionI18nKey: 'permissions.inventory.item.update' },
  { key: 'inventory.item.delete', descriptionI18nKey: 'permissions.inventory.item.delete' },
  { key: 'inventory.item.adjustStock', descriptionI18nKey: 'permissions.inventory.item.adjustStock' },
  { key: 'inventory.viewHistory', descriptionI18nKey: 'permissions.inventory.viewHistory' },
  { key: 'notifications.view', descriptionI18nKey: 'permissions.notifications.view' },
  { key: 'bloodPriority.view', descriptionI18nKey: 'permissions.bloodPriority.view' },
  { key: 'bloodPriority.confirmRead', descriptionI18nKey: 'permissions.bloodPriority.confirmRead' },
  { key: 'bloodPriority.create', descriptionI18nKey: 'permissions.bloodPriority.create' },
  { key: 'accessControls.view', descriptionI18nKey: 'permissions.accessControls.view' },
  { key: 'accessControls.manageUsers', descriptionI18nKey: 'permissions.accessControls.manageUsers' },
  { key: 'accessControls.managePermissions', descriptionI18nKey: 'permissions.accessControls.managePermissions' },
  { key: 'users.activateDeactivate', descriptionI18nKey: 'permissions.users.activateDeactivate' },
  { key: 'users.create', descriptionI18nKey: 'permissions.users.create' },
  { key: 'qr.scan', descriptionI18nKey: 'permissions.qr.scan' },
  { key: 'nfc.read', descriptionI18nKey: 'permissions.nfc.read' },
];

interface UserPermission {
  userId: string;
  permissionId: string;
}

export class MockPermissionsRepository implements PermissionsRepository {
  private async getPermissions(): Promise<Permission[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_PERMISSIONS);
    if (!stored) {
      // Initialize with default permissions
      const permissions: Permission[] = DEFAULT_PERMISSIONS.map((p, index) => ({
        ...p,
        id: 'perm-' + index,
        createdAt: new Date().toISOString(),
      }));
      await AsyncStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
      return permissions;
    }
    return JSON.parse(stored);
  }
  
  private async getUserPermissionsMap(): Promise<UserPermission[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_USER_PERMISSIONS);
    if (!stored) return [];
    return JSON.parse(stored);
  }
  
  private async saveUserPermissions(up: UserPermission[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_USER_PERMISSIONS, JSON.stringify(up));
  }
  
  async getAllPermissions(): Promise<Permission[]> {
    return this.getPermissions();
  }
  
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const allPermissions = await this.getPermissions();
    const userPermissionsMap = await this.getUserPermissionsMap();
    const userPermissionIds = userPermissionsMap
      .filter(up => up.userId === userId)
      .map(up => up.permissionId);
    
    return allPermissions.filter(p => userPermissionIds.includes(p.id));
  }
  
  async assignPermission(userId: string, permissionId: string): Promise<void> {
    const userPermissions = await this.getUserPermissionsMap();
    const exists = userPermissions.some(
      up => up.userId === userId && up.permissionId === permissionId
    );
    if (!exists) {
      userPermissions.push({ userId, permissionId });
      await this.saveUserPermissions(userPermissions);
    }
  }
  
  async revokePermission(userId: string, permissionId: string): Promise<void> {
    const userPermissions = await this.getUserPermissionsMap();
    const filtered = userPermissions.filter(
      up => !(up.userId === userId && up.permissionId === permissionId)
    );
    await this.saveUserPermissions(filtered);
  }
  
  async createPermission(permission: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    const permissions = await this.getPermissions();
    const newPermission: Permission = {
      ...permission,
      id: 'perm-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    permissions.push(newPermission);
    await AsyncStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
    return newPermission;
  }
}
