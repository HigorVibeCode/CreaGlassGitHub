import { InventoryRepository } from '../../services/repositories/interfaces';
import { InventoryGroup, InventoryItem, InventoryHistory } from '../../types';
import { supabase } from '../../services/supabase';

export class SupabaseInventoryRepository implements InventoryRepository {
  async getAllGroups(): Promise<InventoryGroup[]> {
    const { data, error } = await supabase
      .from('inventory_groups')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching inventory groups:', error);
      throw new Error('Failed to fetch inventory groups');
    }

    // If no groups exist, initialize default groups
    if (!data || data.length === 0) {
      await this.initializeDefaultGroups();
      // Fetch again after initialization
      const { data: newData, error: newError } = await supabase
        .from('inventory_groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (newError) {
        console.error('Error fetching inventory groups after init:', newError);
        throw new Error('Failed to fetch inventory groups');
      }

      return (newData || []).map(this.mapToGroup);
    }

    return (data || []).map(this.mapToGroup);
  }

  private async initializeDefaultGroups(): Promise<void> {
    try {
      // Get Master user ID
      const { data: masterUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'Pia')
        .eq('user_type', 'Master')
        .single();

      if (!masterUser) {
        console.warn('Master user not found, cannot initialize default groups');
        return;
      }

      const defaultGroups = [
        { name: 'Glass', created_by: masterUser.id },
        { name: 'Supplies', created_by: masterUser.id },
        { name: 'Spare Parts', created_by: masterUser.id },
      ];

      // Check which groups already exist
      const { data: existingGroups } = await supabase
        .from('inventory_groups')
        .select('name')
        .in('name', defaultGroups.map(g => g.name));

      const existingNames = new Set((existingGroups || []).map(g => g.name));
      const groupsToCreate = defaultGroups.filter(g => !existingNames.has(g.name));

      if (groupsToCreate.length > 0) {
        const { error } = await supabase
          .from('inventory_groups')
          .insert(groupsToCreate);

        if (error) {
          console.error('Error initializing default groups:', error);
        }
      }
    } catch (error) {
      console.error('Error in initializeDefaultGroups:', error);
      // Don't throw - allow operation to continue
    }
  }

  async createGroup(group: Omit<InventoryGroup, 'id' | 'createdAt'>): Promise<InventoryGroup> {
    // Get current authenticated user from Supabase session
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('inventory_groups')
      .insert({
        name: group.name,
        created_by: authUser.id, // Use auth.uid() from Supabase session for RLS
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory group:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to create inventory group: ${error.message || 'Unknown error'}`);
    }

    return this.mapToGroup(data);
  }

  async getGroupById(groupId: string): Promise<InventoryGroup | null> {
    const { data, error } = await supabase
      .from('inventory_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching inventory group:', error);
      throw new Error('Failed to fetch inventory group');
    }

    return data ? this.mapToGroup(data) : null;
  }

  async getItemsByGroup(groupId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error('Failed to fetch inventory items');
    }

    return (data || []).map(this.mapToItem);
  }

  async getAllItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw new Error('Failed to fetch inventory items');
    }

    return (data || []).map(this.mapToItem);
  }

  async getItemById(itemId: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching inventory item:', error);
      throw new Error('Failed to fetch inventory item');
    }

    return data ? this.mapToItem(data) : null;
  }

  async createItem(item: Omit<InventoryItem, 'id' | 'createdAt'>): Promise<InventoryItem> {
    // Get current authenticated user from Supabase session
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    // Use auth.uid() instead of item.createdBy to ensure RLS policy passes
    // RLS policy requires: auth.uid() = created_by
    const insertData: any = {
      group_id: item.groupId,
      name: item.name,
      unit: item.unit,
      stock: item.stock ?? 0,
      low_stock_threshold: item.lowStockThreshold ?? 0,
      created_by: authUser.id, // Use auth.uid() from Supabase session
    };

    // Only add optional fields if they are defined
    if (item.height !== undefined && item.height !== null) insertData.height = item.height;
    if (item.width !== undefined && item.width !== null) insertData.width = item.width;
    if (item.thickness !== undefined && item.thickness !== null) insertData.thickness = item.thickness;
    if (item.totalM2 !== undefined && item.totalM2 !== null) insertData.total_m2 = item.totalM2;
    if (item.idealStock !== undefined && item.idealStock !== null) insertData.ideal_stock = item.idealStock;
    if (item.location !== undefined && item.location !== null && item.location.trim() !== '') {
      insertData.location = item.location.trim();
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Insert data:', JSON.stringify(insertData, null, 2));
      // Provide more specific error message
      const errorMessage = error.message || 'Failed to create inventory item';
      throw new Error(`Failed to create inventory item: ${errorMessage}`);
    }

    const newItem = this.mapToItem(data);

    // Check for low stock and create notification
    if (newItem.stock <= newItem.lowStockThreshold) {
      const { repos } = await import('../../services/container');
      await repos.notificationsRepo.createNotification({
        type: 'inventory.lowStock',
        payloadJson: {
          itemName: newItem.name,
          itemId: newItem.id,
          stock: newItem.stock,
          threshold: newItem.lowStockThreshold,
        },
        createdBySystem: true,
      });
      // Alert is triggered inside createNotification
    }

    return newItem;
  }

  async updateItem(itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const currentItem = await this.getItemById(itemId);
    if (!currentItem) {
      throw new Error('Item not found');
    }

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    if (updates.lowStockThreshold !== undefined) updateData.low_stock_threshold = updates.lowStockThreshold;
    if (updates.height !== undefined) updateData.height = updates.height;
    if (updates.width !== undefined) updateData.width = updates.width;
    if (updates.thickness !== undefined) updateData.thickness = updates.thickness;
    if (updates.totalM2 !== undefined) updateData.total_m2 = updates.totalM2;
    if (updates.idealStock !== undefined) updateData.ideal_stock = updates.idealStock;
    if (updates.location !== undefined) updateData.location = updates.location;

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw new Error('Failed to update inventory item');
    }

    const updatedItem = this.mapToItem(data);

    // Check for low stock notification
    const previousStock = currentItem.stock;
    const previousThreshold = currentItem.lowStockThreshold;
    const stockChanged = updates.stock !== undefined && updates.stock !== previousStock;
    const thresholdChanged = updates.lowStockThreshold !== undefined && updates.lowStockThreshold !== previousThreshold;

    if (updatedItem.stock <= updatedItem.lowStockThreshold) {
      const shouldNotify = (stockChanged && previousStock > updatedItem.lowStockThreshold) ||
                           (thresholdChanged && updatedItem.stock <= updatedItem.lowStockThreshold && previousStock > previousThreshold);

      if (shouldNotify) {
        const { repos } = await import('../../services/container');
        await repos.notificationsRepo.createNotification({
          type: 'inventory.lowStock',
          payloadJson: {
            itemName: updatedItem.name,
            itemId: updatedItem.id,
            stock: updatedItem.stock,
            threshold: updatedItem.lowStockThreshold,
          },
          createdBySystem: true,
        });
      }
    }

    return updatedItem;
  }

  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error('Failed to delete inventory item');
    }
  }

  async adjustStock(itemId: string, delta: number, userId: string): Promise<InventoryItem> {
    const currentItem = await this.getItemById(itemId);
    if (!currentItem) {
      throw new Error('Item not found');
    }

    const previousValue = currentItem.stock;
    const newValue = previousValue + delta;

    const { data, error } = await supabase
      .from('inventory_items')
      .update({ stock: newValue })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error adjusting stock:', error);
      throw new Error('Failed to adjust stock');
    }

    // Create history entry
    await supabase
      .from('inventory_history')
      .insert({
        item_id: itemId,
        action: 'adjustStock',
        delta,
        previous_value: previousValue,
        new_value: newValue,
        created_by: userId,
      });

    const updatedItem = this.mapToItem(data);

    // Check for low stock notification
    if (updatedItem.stock <= updatedItem.lowStockThreshold && previousValue > updatedItem.lowStockThreshold) {
      const { repos } = await import('../../services/container');
      await repos.notificationsRepo.createNotification({
        type: 'inventory.lowStock',
        payloadJson: {
          itemName: updatedItem.name,
          itemId: updatedItem.id,
          stock: updatedItem.stock,
          threshold: updatedItem.lowStockThreshold,
        },
        createdBySystem: true,
      });
    }

    return updatedItem;
  }

  async getItemHistory(itemId: string): Promise<InventoryHistory[]> {
    const { data, error } = await supabase
      .from('inventory_history')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory history:', error);
      throw new Error('Failed to fetch inventory history');
    }

    return (data || []).map(this.mapToHistory);
  }

  private mapToGroup(data: any): InventoryGroup {
    return {
      id: data.id,
      name: data.name,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }

  private mapToItem(data: any): InventoryItem {
    return {
      id: data.id,
      groupId: data.group_id,
      name: data.name,
      unit: data.unit,
      stock: parseFloat(data.stock),
      lowStockThreshold: parseFloat(data.low_stock_threshold),
      createdBy: data.created_by,
      createdAt: data.created_at,
      height: data.height ? parseFloat(data.height) : undefined,
      width: data.width ? parseFloat(data.width) : undefined,
      thickness: data.thickness ? parseFloat(data.thickness) : undefined,
      totalM2: data.total_m2 ? parseFloat(data.total_m2) : undefined,
      idealStock: data.ideal_stock ? parseFloat(data.ideal_stock) : undefined,
      location: data.location || undefined,
    };
  }

  private mapToHistory(data: any): InventoryHistory {
    return {
      id: data.id,
      itemId: data.item_id,
      action: data.action,
      delta: parseFloat(data.delta),
      previousValue: parseFloat(data.previous_value),
      newValue: parseFloat(data.new_value),
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }
}
