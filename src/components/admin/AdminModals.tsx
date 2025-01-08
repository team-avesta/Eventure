import { ModalType } from '@/hooks/useAdminState';
import ModuleModal from './modals/ModuleModal';
import PageViewModal from './modals/PageViewModal';
import DimensionModal from './modals/DimensionModal';
import EventCategoryModal from './modals/EventCategoryModal';
import EventActionModal from './modals/EventActionModal';
import EventNameModal from './modals/EventNameModal';
import ManageModuleModal from './modals/ManageModuleModal';
import ManagePageViewModal from './modals/ManagePageViewModal';
import ManageDimensionModal from './modals/ManageDimensionModal';
import ManageEventCategoryModal from './modals/ManageEventCategoryModal';
import ManageEventActionModal from './modals/ManageEventActionModal';
import ManageEventNameModal from './modals/ManageEventNameModal';

interface AdminModalsProps {
  modalState: {
    type: ModalType;
    isManage: boolean;
  };
  isSubmitting: boolean;
  closeModal: () => void;
  handleSubmit: (type: string, data: any) => void;
}

export function AdminModals({
  modalState,
  isSubmitting,
  closeModal,
  handleSubmit,
}: AdminModalsProps) {
  return (
    <>
      <ModuleModal
        isOpen={modalState.type === 'module' && !modalState.isManage}
        onClose={closeModal}
        onSubmit={(name) => handleSubmit('module', { name })}
        isSubmitting={isSubmitting}
      />
      <ManageModuleModal
        isOpen={modalState.type === 'module' && modalState.isManage}
        onClose={closeModal}
      />
      <PageViewModal
        isOpen={modalState.type === 'pageview' && !modalState.isManage}
        onClose={closeModal}
        onSubmit={(data) => handleSubmit('pageview', data)}
        isSubmitting={isSubmitting}
      />
      <ManagePageViewModal
        isOpen={modalState.type === 'pageview' && modalState.isManage}
        onClose={closeModal}
      />
      <DimensionModal
        isOpen={modalState.type === 'dimension' && !modalState.isManage}
        onClose={closeModal}
        onSubmit={(data) => handleSubmit('dimension', data)}
        isSubmitting={isSubmitting}
      />
      <ManageDimensionModal
        isOpen={modalState.type === 'dimension' && modalState.isManage}
        onClose={closeModal}
      />
      <EventCategoryModal
        isOpen={modalState.type === 'category' && !modalState.isManage}
        onClose={closeModal}
        onSubmit={(name) => handleSubmit('category', { name })}
        isSubmitting={isSubmitting}
      />
      <ManageEventCategoryModal
        isOpen={modalState.type === 'category' && modalState.isManage}
        onClose={closeModal}
      />
      <EventActionModal
        isOpen={modalState.type === 'action' && !modalState.isManage}
        onClose={closeModal}
        onSubmit={(name) => handleSubmit('action', { name })}
        isSubmitting={isSubmitting}
      />
      <ManageEventActionModal
        isOpen={modalState.type === 'action' && modalState.isManage}
        onClose={closeModal}
      />
      <EventNameModal
        isOpen={modalState.type === 'name' && !modalState.isManage}
        onClose={closeModal}
        onSubmit={(name) => handleSubmit('name', { name })}
        isSubmitting={isSubmitting}
      />
      <ManageEventNameModal
        isOpen={modalState.type === 'name' && modalState.isManage}
        onClose={closeModal}
      />
    </>
  );
}
