import { toast } from 'react-hot-toast';

export const useToast = () => {
  const success = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  };

  const warning = (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: '⚠️',
    });
  };

  const info = (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  };

  return { success, error, warning, info };
};