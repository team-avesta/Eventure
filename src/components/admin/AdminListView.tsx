'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/shared/Button';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import ModuleModal from './modals/ModuleModal';
import PageViewModal from './modals/PageViewModal';
import DimensionModal from './modals/DimensionModal';
import EventCategoryModal from './modals/EventCategoryModal';
import EventActionModal from './modals/EventActionModal';
import EventNameModal from './modals/EventNameModal';
import DimensionTypeModal from './modals/DimensionTypeModal';
import PageLabelModal from './modals/PageLabelModal';
import { pageLabelService } from '@/services/pageLabelService';
import { FiPlus } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';

interface AdminListViewProps {
  type:
    | 'module'
    | 'pageview'
    | 'dimension'
    | 'category'
    | 'action'
    | 'name'
    | 'dimensionType'
    | 'pageLabel';
  title: string;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="text-center py-8">
      <CgSpinner
        size={16}
        className="animate-spin mx-auto"
        role="progressbar"
      />
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
        case 'dimensionType':
          data = await adminS3Service.fetchDimensionTypes();
          break;
        case 'pageLabel':
          data = await pageLabelService.getAllLabels();
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
          case 'dimensionType':
            await adminS3Service.updateDimensionType(selectedItem.id, data);
            break;
          case 'pageLabel':
            await pageLabelService.updateLabel(selectedItem.id, data);
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
          case 'dimensionType':
            await adminS3Service.createDimensionType(data);
            break;
          case 'pageLabel':
            await pageLabelService.createLabel(data);
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
        case 'dimensionType':
          await adminS3Service.deleteDimensionType(selectedItem.id);
          break;
        case 'pageLabel':
          await pageLabelService.deleteLabel(selectedItem.id);
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
      case 'dimensionType':
        return <DimensionTypeModal {...modalProps} />;
      case 'pageLabel':
        return <PageLabelModal {...modalProps} />;
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Back"
            >
              <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your {title.toLowerCase()}
              </p>
            </div>
          </div>
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add {title}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (!items.length) {
      return <EmptyState />;
    }

    const getItemName = (item: any) => {
      switch (type) {
        case 'pageview':
          return item.title;
        case 'module':
          return item.name;
        case 'dimension':
          return (
            <span>
              {item.id}. {item.name}{' '}
              {item.type && <i className="text-gray-500">({item.type})</i>}
            </span>
          );
        case 'category':
        case 'action':
        case 'name':
          return item;
        case 'dimensionType':
          return item.name;
        default:
          return item.name;
      }
    };

    const getExtraInfo = (item: any) => {
      switch (type) {
        case 'pageview':
          return item.url;
        case 'dimension':
          return item.description;
        default:
          return null;
      }
    };

    return (
      <div className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {type === 'pageview' ? 'Title' : 'Name'}
                </th>
                {(type === 'pageview' || type === 'dimension') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {type === 'pageview' ? 'URL' : 'Description'}
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id || item.key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getItemName(item)}
                  </td>
                  {(type === 'pageview' || type === 'dimension') && (
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                      <div className="break-words">{getExtraInfo(item)}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                      aria-label="Edit"
                    >
                      <PencilIcon className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete"
                    >
                      <TrashIcon className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      {renderModal()}
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
    </div>
  );
}
