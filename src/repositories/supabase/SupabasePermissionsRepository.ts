import { PermissionsRepository } from '../../services/repositories/interfaces';
import { Permission } from '../../types';
import { supabase } from '../../services/supabase';

export class SupabasePermissionsRepository implements PermissionsRepository {
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      throw new Error('Failed to fetch permissions');
    }

    return (data || []).map(this.mapToPermission);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('permission_id, permissions(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user permissions:', error);
      throw new Error('Failed to fetch user permissions');
    }

    return (data || [])
      .map((item: any) => item.permissions)
      .filter(Boolean)
      .map(this.mapToPermission);
  }

  async assignPermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .insert({
        user_id: userId,
        permission_id: permissionId,
      });

    if (error) {
      // Ignore duplicate key errors
      if (error.code !== '23505') {
        console.error('Error assigning permission:', error);
        throw new Error('Failed to assign permission');
      }
    }
  }

  async revokePermission(userId: string, permissionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId);

    if (error) {
      console.error('Error revoking permission:', error);
      throw new Error('Failed to revoke permission');
    }
  }

  async createPermission(permission: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        key: permission.key,
        description_i18n_key: permission.descriptionI18nKey,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating permission:', error);
      throw new Error('Failed to create permission');
    }

    return this.mapToPermission(data);
  }

  private mapToPermission(data: any): Permission {
    return {
      id: data.id,
      key: data.key,
      descriptionI18nKey: data.description_i18n_key,
      createdAt: data.created_at,
    };
  }
}
