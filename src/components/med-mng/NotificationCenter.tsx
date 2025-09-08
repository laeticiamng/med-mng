import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useNotifications } from './NotificationProvider';

export const NotificationCenter: React.FC = () => {
  const { state, addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      addNotification({
        title: 'Bienvenue sur MED-MNG',
        message: 'Plateforme optimisée et prête !',
        type: 'success',
        priority: 'medium',
        category: 'system',
        persistent: false,
      });
    }, 2000);

    return () => clearTimeout(demoTimeout);
  }, [addNotification]);

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {state.unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {state.unreadCount > 99 ? '99+' : state.unreadCount}
        </motion.div>
      )}
    </Button>
  );
};