import { useState } from 'react';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

export type ModalType =
  | 'module'
  | 'pageview'
  | 'dimension'
  | 'category'
  | 'action'
  | 'name'
  | null;

interface ModalState {
  type: ModalType;
  isManage: boolean;
}

export function useAdminState() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isManage: false,
  });

  const openModal = async (type: ModalType, isManage = false) => {
    setModalState({ type, isManage });
  };

  const closeModal = () => {
    setModalState({ type: null, isManage: false });
  };

  const handleSubmit = async (type: string, data: any) => {
    setIsSubmitting(true);
    try {
      switch (type) {
        case 'module':
          if (!modalState.isManage) {
            await adminS3Service.createModule(data.name);
            toast.success('Module added successfully');
          } else {
            await adminS3Service.deleteModule(data);
            toast.success('Module deleted successfully');
          }
          break;

        case 'pageview':
          if (!modalState.isManage) {
            await adminS3Service.createPageView(data);
            toast.success('Page view added successfully');
          } else {
            await adminS3Service.deletePageView(data);
            toast.success('Page view deleted successfully');
          }
          break;

        case 'dimension':
          if (!modalState.isManage) {
            await adminS3Service.createDimension(data);
            toast.success('Dimension added successfully');
          } else {
            await adminS3Service.deleteDimension(data);
            toast.success('Dimension deleted successfully');
          }
          break;

        case 'category':
          if (!modalState.isManage) {
            await adminS3Service.createEventCategory(data);
            toast.success('Event category added successfully');
          } else {
            await adminS3Service.deleteEventCategory(data);
            toast.success('Event category deleted successfully');
          }
          break;

        case 'action':
          if (!modalState.isManage) {
            await adminS3Service.createEventAction(data);
            toast.success('Event action added successfully');
          } else {
            await adminS3Service.deleteEventAction(data);
            toast.success('Event action deleted successfully');
          }
          break;

        case 'name':
          if (!modalState.isManage) {
            await adminS3Service.createEventName(data);
            toast.success('Event name added successfully');
          } else {
            await adminS3Service.deleteEventName(data);
            toast.success('Event name deleted successfully');
          }
          break;
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to update data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isSubmitting,
    modalState,
    openModal,
    closeModal,
    handleSubmit,
  };
}
