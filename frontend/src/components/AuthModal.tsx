import React from 'react';
import { MobileAuthScreen } from './MobileAuthScreen';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  if (!isOpen) return null;

  return (
    <MobileAuthScreen
      initialMode={defaultMode}
      onClose={onClose}
    />
  );
};
