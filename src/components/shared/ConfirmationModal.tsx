import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: ConfirmationModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-label="modal-backdrop"
          />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-200">
                <div className="bg-white p-6 sm:p-8">
                  <div className="sm:flex sm:items-start gap-4">
                    <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100/80 sm:mx-0">
                      <ExclamationTriangleIcon
                        className="h-8 w-8 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-4 text-center sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-semibold leading-6 text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                      <div className="mt-4">
                        <p className="text-base leading-relaxed text-gray-600">
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmText}
                  </button>
                  <button
                    type="button"
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-150 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
