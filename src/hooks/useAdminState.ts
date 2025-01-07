import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export type ModalType =
  | 'module'
  | 'pageview'
  | 'dimension'
  | 'category'
  | 'action'
  | 'event';

interface ModalState {
  add: Record<ModalType, boolean>;
  manage: Record<ModalType, boolean>;
}

export function useAdminState() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    add: {
      module: false,
      pageview: false,
      dimension: false,
      category: false,
      action: false,
      event: false,
    },
    manage: {
      module: false,
      pageview: false,
      dimension: false,
      category: false,
      action: false,
      event: false,
    },
  });

  const openModal = (type: ModalType, isManage: boolean = false) => {
    setModalState((prev) => ({
      ...prev,
      [isManage ? 'manage' : 'add']: {
        ...prev[isManage ? 'manage' : 'add'],
        [type]: true,
      },
    }));
  };

  const closeModal = (type: ModalType, isManage: boolean = false) => {
    setModalState((prev) => ({
      ...prev,
      [isManage ? 'manage' : 'add']: {
        ...prev[isManage ? 'manage' : 'add'],
        [type]: false,
      },
    }));
  };

  const handleSubmit = async (type: ModalType, data: any, endpoint: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add ${type}`);
      }

      toast.success(`${type} added successfully`);
      closeModal(type);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to add ${type}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin && !isLoading) {
    router.push('/screenshots');
  }

  return {
    isLoading,
    isSubmitting,
    modalState,
    openModal,
    closeModal,
    handleSubmit,
  };
}
