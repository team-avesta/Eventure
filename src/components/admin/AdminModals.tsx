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
    add: Record<ModalType, boolean>;
    manage: Record<ModalType, boolean>;
  };
  isSubmitting: boolean;
  closeModal: (type: ModalType, isManage?: boolean) => void;
  handleSubmit: (type: ModalType, data: any, endpoint: string) => void;
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
        isOpen={modalState.add.module}
        onClose={() => closeModal('module')}
        onSubmit={(name) => handleSubmit('module', { name }, 'modules')}
        isSubmitting={isSubmitting}
      />
      <ManageModuleModal
        isOpen={modalState.manage.module}
        onClose={() => closeModal('module', true)}
      />
      <PageViewModal
        isOpen={modalState.add.pageview}
        onClose={() => closeModal('pageview')}
        onSubmit={(data) => handleSubmit('pageview', data, 'pageviews')}
        isSubmitting={isSubmitting}
      />
      <ManagePageViewModal
        isOpen={modalState.manage.pageview}
        onClose={() => closeModal('pageview', true)}
      />
      <DimensionModal
        isOpen={modalState.add.dimension}
        onClose={() => closeModal('dimension')}
        onSubmit={(data) => handleSubmit('dimension', data, 'dimensions')}
        isSubmitting={isSubmitting}
      />
      <ManageDimensionModal
        isOpen={modalState.manage.dimension}
        onClose={() => closeModal('dimension', true)}
      />
      <EventCategoryModal
        isOpen={modalState.add.category}
        onClose={() => closeModal('category')}
        onSubmit={(name) =>
          handleSubmit('category', { name }, 'event-categories')
        }
        isSubmitting={isSubmitting}
      />
      <ManageEventCategoryModal
        isOpen={modalState.manage.category}
        onClose={() => closeModal('category', true)}
      />
      <EventActionModal
        isOpen={modalState.add.action}
        onClose={() => closeModal('action')}
        onSubmit={(name) => handleSubmit('action', { name }, 'event-actions')}
        isSubmitting={isSubmitting}
      />
      <ManageEventActionModal
        isOpen={modalState.manage.action}
        onClose={() => closeModal('action', true)}
      />
      <EventNameModal
        isOpen={modalState.add.event}
        onClose={() => closeModal('event')}
        onSubmit={(name) => handleSubmit('event', { name }, 'event-names')}
        isSubmitting={isSubmitting}
      />
      <ManageEventNameModal
        isOpen={modalState.manage.event}
        onClose={() => closeModal('event', true)}
      />
    </>
  );
}
