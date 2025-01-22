'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/icons/Spinner';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import ModuleModal from './modals/ModuleModal';
import PageViewModal from './modals/PageViewModal';
import DimensionModal from './modals/DimensionModal';
import EventCategoryModal from './modals/EventCategoryModal';
import EventActionModal from './modals/EventActionModal';
import EventNameModal from './modals/EventNameModal';

interface AdminListViewProps {
  type: 'module' | 'pageview' | 'dimension' | 'category' | 'action' | 'name';
  title: string;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="text-center py-8">
      <Spinner className="mx-auto" />
      <div className="mt-2 text-sm text-gray-500">Loading items...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No items available</p>
    </div>
  );
}

export function AdminListView({ type, title, onClose }: AdminListViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let data;
      switch (type) {
        case 'module':
          data = await adminS3Service.fetchModules();
          break;
        case 'pageview':
          data = await adminS3Service.fetchPageViews();
          break;
        case 'dimension':
          data = await adminS3Service.fetchDimensions();
          break;
        case 'category':
          data = await adminS3Service.fetchEventCategories();
          break;
        case 'action':
          data = await adminS3Service.fetchEventActions();
          break;
        case 'name':
          data = await adminS3Service.fetchEventNames();
          break;
      }
      setItems(data);
    } catch (error) {
      toast.error(`Failed to fetch ${type}s`);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedItem) {
        // Handle edit
        switch (type) {
          case 'module':
            await adminS3Service.updateModule(selectedItem.key, data);
            break;
          case 'pageview':
            await adminS3Service.updatePageView(selectedItem.id, data);
            break;
          case 'dimension':
            await adminS3Service.updateDimension(selectedItem.id, data);
            break;
          case 'category':
            await adminS3Service.updateEventCategory(selectedItem, data);
            break;
          case 'action':
            await adminS3Service.updateEventAction(selectedItem, data);
            break;
          case 'name':
            await adminS3Service.updateEventName(selectedItem, data);
            break;
        }
        toast.success(`${title} updated successfully`);
      } else {
        // Handle add
        switch (type) {
          case 'module':
            await adminS3Service.createModule(data);
            break;
          case 'pageview':
            await adminS3Service.createPageView(data);
            break;
          case 'dimension':
            await adminS3Service.createDimension(data);
            break;
          case 'category':
            await adminS3Service.createEventCategory(data);
            break;
          case 'action':
            await adminS3Service.createEventAction(data);
            break;
          case 'name':
            await adminS3Service.createEventName(data);
            break;
        }
        toast.success(`${title} added successfully`);
      }
      await fetchItems();
      setShowModal(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error(
        selectedItem
          ? `Failed to update ${title.toLowerCase()}`
          : `Failed to add ${title.toLowerCase()}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      switch (type) {
        case 'module':
          await adminS3Service.deleteModule(selectedItem.key);
          break;
        case 'pageview':
          await adminS3Service.deletePageView(selectedItem.id);
          break;
        case 'dimension':
          await adminS3Service.deleteDimension(selectedItem.id);
          break;
        case 'category':
          await adminS3Service.deleteEventCategory(selectedItem);
          break;
        case 'action':
          await adminS3Service.deleteEventAction(selectedItem);
          break;
        case 'name':
          await adminS3Service.deleteEventName(selectedItem);
          break;
      }
      await fetchItems();
      toast.success(`${title} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${title.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
      setSelectedItem(null);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const renderModal = () => {
    const modalProps = {
      isOpen: showModal,
      onClose: () => {
        setShowModal(false);
        setSelectedItem(null);
      },
      onSubmit: handleSubmit,
      isSubmitting,
      initialData: selectedItem,
    };

    switch (type) {
      case 'module':
        return <ModuleModal {...modalProps} />;
      case 'pageview':
        return <PageViewModal {...modalProps} />;
      case 'dimension':
        return <DimensionModal {...modalProps} />;
      case 'category':
        return <EventCategoryModal {...modalProps} />;
      case 'action':
        return <EventActionModal {...modalProps} />;
      case 'name':
        return <EventNameModal {...modalProps} />;
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200 pr-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your {title.toLowerCase()}
        </p>
      </div>
      <Button onClick={handleAdd} className="flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Add New</span>
      </Button>
    </div>
  );

  const renderItem = (item: any) => {
    const itemName =
      type === 'module'
        ? item.name
        : type === 'pageview'
        ? item.title
        : type === 'dimension'
        ? `${item.id}. ${item.name}`
        : item;

    return (
      <div
        key={
          type === 'module'
            ? item.key
            : type === 'pageview'
            ? item.id
            : type === 'dimension'
            ? item.id
            : item
        }
        className="flex items-center justify-between py-3 hover:bg-gray-50/80 px-4 rounded-lg border border-gray-100"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {itemName}
          </p>
          {type === 'pageview' && (
            <p className="text-sm text-gray-500 truncate">{item.url}</p>
          )}
          {type === 'dimension' && item.description && (
            <p className="text-sm text-gray-500 truncate">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => handleEdit(item)}
            className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors border border-gray-200"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors border border-gray-200"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (items.length === 0) {
      return <EmptyState />;
    }

    return <div className="space-y-2">{items.map(renderItem)}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-2xl">
          <div className="absolute right-0 top-0 hidden md:block">
            <button
              type="button"
              className="m-2 rounded-lg bg-white text-gray-400 hover:text-gray-500 focus:outline-none p-1 hover:bg-gray-50 border border-gray-200"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {renderHeader()}
            <div className="mt-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${title}`}
        message={`Are you sure you want to delete this ${title.toLowerCase()}? This action cannot be undone.`}
        confirmText={`Delete ${title}`}
        cancelText="Cancel"
      />

      {renderModal()}
    </div>
  );
}
