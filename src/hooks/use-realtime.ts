import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { triggerNotificationAlert } from '../utils/notification-alert';
import { useAuth } from '../store/auth-store';

/**
 * Hook para ativar subscriptions Realtime do Supabase
 * Atualiza automaticamente os dados quando houver mudanças no banco
 */
export const useRealtime = () => {
  const queryClient = useQueryClient();
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Configurar subscriptions para as principais tabelas
    const setupSubscriptions = () => {
      // Subscription para documentos
      const documentsChannel = supabase
        .channel('documents-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents',
          },
          (payload) => {
            console.log('Documents change:', payload);
            // Invalidar queries relacionadas a documentos
            queryClient.invalidateQueries({ queryKey: ['documents'] });
          }
        )
        .subscribe();

      // Subscription para inventário
      const inventoryChannel = supabase
        .channel('inventory-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
          },
          (payload) => {
            console.log('Inventory items change:', payload);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-groups'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_groups',
          },
          (payload) => {
            console.log('Inventory groups change:', payload);
            queryClient.invalidateQueries({ queryKey: ['inventory-groups'] });
          }
        )
        .subscribe();

      // Subscription para notificações
      const notificationsChannel = supabase
        .channel('notifications-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('Notification change:', payload);
            
            // Se for uma nova notificação (INSERT) e for para o usuário atual, tocar som
            if (payload.eventType === 'INSERT' && payload.new && user) {
              const notification = payload.new;
              // Verificar se a notificação é para o usuário atual ou é global
              const isForCurrentUser = !notification.target_user_id || notification.target_user_id === user.id;
              
              if (isForCurrentUser) {
                // Preparar mensagem para o alert
                let alertMessage: string | undefined;
                if (notification.type === 'inventory.lowStock' && notification.payload_json) {
                  const payload = typeof notification.payload_json === 'string' 
                    ? JSON.parse(notification.payload_json) 
                    : notification.payload_json;
                  alertMessage = `Estoque baixo: ${payload.itemName || 'Item'} (${payload.stock || 0} unidades)`;
                }
                
                // Tocar som de notificação (não aguardamos o som terminar)
                triggerNotificationAlert(notification.type, alertMessage).catch(err => {
                  console.warn('Failed to trigger notification alert:', err);
                });
              }
            }
            
            // Invalidar todas as queries de notificações (incluindo contagem de não lidas)
            // Isso vai invalidar tanto ['notifications', userId] quanto ['notifications', 'unreadCount', userId]
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
            
            // Se o payload contém target_user_id, invalidar especificamente para esse usuário
            if (payload.new?.target_user_id) {
              const userId = payload.new.target_user_id;
              queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount', userId] });
            }
            // Se não tem target_user_id, é uma notificação global, invalidar para todos
            if (!payload.new?.target_user_id && !payload.old?.target_user_id) {
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
            }
          }
        )
        .subscribe();

      // Subscription para produção
      const productionChannel = supabase
        .channel('productions-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'productions',
          },
          (payload) => {
            console.log('Productions change:', payload);
            queryClient.invalidateQueries({ queryKey: ['productions'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'production_items',
          },
          (payload) => {
            console.log('Production items change:', payload);
            queryClient.invalidateQueries({ queryKey: ['productions'] });
            queryClient.invalidateQueries({ queryKey: ['production-items'] });
          }
        )
        .subscribe();

      // Subscription para eventos
      const eventsChannel = supabase
        .channel('events-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
          },
          (payload) => {
            console.log('Events change:', payload);
            queryClient.invalidateQueries({ queryKey: ['events'] });
          }
        )
        .subscribe();

      // Subscription para usuários (apenas para admins)
      const usersChannel = supabase
        .channel('users-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
          },
          (payload) => {
            console.log('Users change:', payload);
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }
        )
        .subscribe();

      // Subscription para Blood Priority
      const bloodPriorityChannel = supabase
        .channel('blood-priority-changes', {
          config: { private: true },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'blood_priority_messages',
          },
          (payload) => {
            console.log('Blood priority messages change:', payload);
            queryClient.invalidateQueries({ queryKey: ['blood-priority'] });
          }
        )
        .subscribe();

      channelsRef.current = [
        documentsChannel,
        inventoryChannel,
        notificationsChannel,
        productionChannel,
        eventsChannel,
        usersChannel,
        bloodPriorityChannel,
      ];
    };

    // Verificar se está autenticado antes de criar subscriptions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setupSubscriptions();
      }
    });

    // Cleanup: remover todas as subscriptions quando o componente desmontar
    return () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [queryClient, user]);
};

/**
 * Hook específico para subscription de uma tabela
 */
export const useRealtimeSubscription = (
  table: string,
  schema: string = 'public',
  events: ('INSERT' | 'UPDATE' | 'DELETE' | '*')[] = ['*']
) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const setupSubscription = () => {
      const channel = supabase
        .channel(`${table}-realtime`, {
          config: { private: true },
        });

      events.forEach((event) => {
        channel.on(
          'postgres_changes',
          {
            event: event === '*' ? '*' : event,
            schema,
            table,
          },
          (payload) => {
            console.log(`${table} ${event}:`, payload);
            queryClient.invalidateQueries({ queryKey: [table] });
          }
        );
      });

      channel.subscribe();
      channelRef.current = channel;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setupSubscription();
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, events, queryClient]);
};
