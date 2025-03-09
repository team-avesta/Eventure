'use client';

import Link from 'next/link';
import { FiArrowUp } from 'react-icons/fi';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Eventure Event Tracking Tool
          </h1>
          <p className="text-xl text-gray-600">
            A comprehensive guide for new users and administrators
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="#getting-started"
              className="text-blue-600 hover:text-blue-800"
            >
              Getting Started
            </a>
            <a href="#user-roles" className="text-blue-600 hover:text-blue-800">
              User Roles
            </a>
            <a
              href="#event-types"
              className="text-blue-600 hover:text-blue-800"
            >
              Event Types
            </a>
            <a
              href="#screenshot-management"
              className="text-blue-600 hover:text-blue-800"
            >
              Screenshot Management
            </a>
            <a
              href="#event-tracking"
              className="text-blue-600 hover:text-blue-800"
            >
              Event Tracking
            </a>
            <a href="#dimensions" className="text-blue-600 hover:text-blue-800">
              Dimensions
            </a>
            <a
              href="#best-practices"
              className="text-blue-600 hover:text-blue-800"
            >
              Best Practices
            </a>
            <a
              href="#troubleshooting"
              className="text-blue-600 hover:text-blue-800"
            >
              Troubleshooting
            </a>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Getting Started */}
          <section
            id="getting-started"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Getting Started
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                Welcome to the Eventure Matomo Tracking Tool! This guide will
                help you understand and effectively use our event tracking
                system.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                First Steps
              </h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to the system using your credentials</li>
                <li>Familiarize yourself with the dashboard layout</li>
                <li>Check your access level and available features</li>
                <li>Review the event types and their purposes</li>
              </ol>
            </div>
          </section>

          {/* User Roles */}
          <section
            id="user-roles"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              User Roles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Admin User
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Full system access</li>
                  <li>
                    Module Management:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        Create new modules with custom names and descriptions
                      </li>
                      <li>Edit existing module configurations</li>
                      <li>Assign users to specific modules</li>
                      <li>Set module visibility and access permissions</li>
                      <li>Archive or delete unused modules</li>
                      <li>Manage module-specific event configurations</li>
                    </ul>
                  </li>
                  <li>
                    Event Type Configuration:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Define custom event categories per module</li>
                      <li>Set up event action templates</li>
                      <li>Configure default event values</li>
                    </ul>
                  </li>
                  <li>
                    Dimension Management:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Create and edit custom dimensions</li>
                      <li>Set dimension scope (hit, visit, or session)</li>
                      <li>Configure dimension validation rules</li>
                    </ul>
                  </li>
                  <li>
                    Access Control:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Manage user roles and permissions</li>
                      <li>Grant or revoke module access</li>
                      <li>Monitor user activity logs</li>
                    </ul>
                  </li>
                  <li>
                    System Configuration:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Configure global tracking settings</li>
                      <li>Manage API integrations</li>
                      <li>Set up data retention policies</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Regular User
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>
                    View Events:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Access to view events added by admin</li>
                      <li>View event details and configurations</li>
                      <li>Cannot modify or create new events</li>
                    </ul>
                  </li>
                  <li>
                    Module Access:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>View assigned modules only</li>
                      <li>Browse screenshots within assigned modules</li>
                      <li>No screenshot upload/management permissions</li>
                    </ul>
                  </li>
                  <li>
                    Analytics:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>View analytics based on assigned permissions</li>
                      <li>Access reports within authorized modules</li>
                      <li>Export data based on permission level</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Event Types */}
          <section
            id="event-types"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Event Types
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#2563EB]"></div>
                <div>
                  <span className="font-semibold">Page View</span> - Track when
                  users view specific pages
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-gray-600">
                <p className="mb-2">Required fields:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Custom Title - Select from predefined page titles</li>
                  <li>
                    Custom URL - Automatically populated based on title
                    selection
                  </li>
                  <li>Optional: Select relevant dimensions</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#16A34A]"></div>
                <div>
                  <span className="font-semibold">
                    TrackEvent with PageView
                  </span>{' '}
                  - Combined tracking of page views and events
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-gray-600">
                <p className="mb-2">Required fields:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Event Category - Choose from predefined categories</li>
                  <li>Event Action Name - Select appropriate action</li>
                  <li>Optional: Event Name, Event Value, Dimensions</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#9333EA]"></div>
                <div>
                  <span className="font-semibold">TrackEvent</span> - Track
                  specific user interactions
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-gray-600">
                <p className="mb-2">Required fields:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Event Category - Choose from predefined categories</li>
                  <li>Event Action Name - Select appropriate action</li>
                  <li>Optional: Event Name, Event Value, Dimensions</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#DC2626]"></div>
                <div>
                  <span className="font-semibold">Outlink</span> - Monitor
                  external link clicks
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-gray-600">
                <p className="mb-2">Fixed fields:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Event Category - Always set to &ldquo;Common&rdquo;</li>
                  <li>Event Action - Always set to &ldquo;Outlink&rdquo;</li>
                  <li>Optional: Event Name, Event Value, Dimensions</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
                <div>
                  <span className="font-semibold">Backend Event</span> - Events
                  triggered by backend operations
                </div>
              </div>
              <div className="mt-2 ml-7 text-sm text-gray-600">
                <p className="mb-2">Required fields:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Event Category - Choose from predefined categories</li>
                  <li>Event Action Name - Select appropriate action</li>
                  <li>Optional: Event Name, Event Value, Dimensions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Screenshot Management */}
          <section
            id="screenshot-management"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Screenshot Management
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Capturing Screenshots
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Open the target webpage</li>
                  <li>Open Developer Tools (F12)</li>
                  <li>Press Ctrl + Shift + P</li>
                  <li>Type &ldquo;Capture full size screenshot&rdquo;</li>
                  <li>Save the high-resolution image</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Uploading Screenshots
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Navigate to your module</li>
                  <li>Click &ldquo;Upload Screenshot&rdquo;</li>
                  <li>Select your image file</li>
                  <li>Add a descriptive name</li>
                  <li>Click Upload</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Reordering Screenshots
                </h3>
                <p className="text-gray-600 mb-2">
                  Admin users can reorder screenshots within a module:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Click the &ldquo;Reorder Screenshots&rdquo; button</li>
                  <li>When in reorder mode, screenshots will be highlighted</li>
                  <li>Click and drag screenshots to their new positions</li>
                  <li>The order is automatically saved after each move</li>
                  <li>Click &ldquo;Exit Reorder Mode&rdquo; when finished</li>
                </ol>
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="font-semibold">Note:</p>
                  <p>
                    Reordering is only available to admin users and requires at
                    least two screenshots in the module.
                  </p>
                </div>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="font-semibold">Pro Tip:</p>
                <p>
                  Use meaningful names for screenshots to make them easily
                  identifiable later. Organize screenshots in a logical order to
                  improve workflow efficiency.
                </p>
              </div>
            </div>
          </section>

          {/* Screenshot Status */}
          <section
            id="screenshot-status"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Screenshot Status Management
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Each screenshot can have one of three status values:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">TODO</h3>
                  <p className="text-gray-600">
                    Initial status when screenshot is uploaded, indicating work
                    needs to be done
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">IN_PROGRESS</h3>
                  <p className="text-gray-600">
                    Work has started on adding events to this screenshot
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">DONE</h3>
                  <p className="text-gray-600">
                    All necessary events have been added and verified
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Event Configuration */}
          <section
            id="event-configuration"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Event Configuration Details
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Event Categories
                </h3>
                <p className="text-gray-600 mb-2">
                  Categories help organize events by their general purpose or
                  area. Examples:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>Agent</li>
                  <li>Common</li>
                  <li>Search</li>
                  <li>Listing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Event Actions
                </h3>
                <p className="text-gray-600 mb-2">
                  Actions describe what the event does. Examples:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>InSearchResult</li>
                  <li>Click</li>
                  <li>View</li>
                  <li>Submit</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Event Names and Values
                </h3>
                <p className="text-gray-600 mb-2">
                  Optional fields to provide additional context:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>Event Name: Additional identifier for the event</li>
                  <li>
                    Event Value: Numeric or text value associated with the event
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Image Management */}
          <section
            id="image-management"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Image Management
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Image Replacement
                </h3>
                <p className="text-gray-600 mb-2">
                  When UI changes occur, you can replace existing screenshots:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Click the &ldquo;Replace Image&rdquo; button</li>
                  <li>Upload new screenshot</li>
                  <li>Existing events will be preserved</li>
                  <li>Adjust event positions if needed using drag mode</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Drag Mode Features
                </h3>
                <p className="text-gray-600 mb-2">
                  Use drag mode to adjust events:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>Toggle drag mode using the switch in the toolbar</li>
                  <li>Click and drag events to new positions</li>
                  <li>Use corner handles to resize events</li>
                  <li>Double-click to edit event details</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Event Tracking */}
          <section
            id="event-tracking"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Event Tracking
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Adding New Events
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                  <li>Open your screenshot</li>
                  <li>Click &ldquo;Add New Event&rdquo;</li>
                  <li>Select the event type</li>
                  <li>Draw the event area on the screenshot</li>
                  <li>Fill in the event details</li>
                  <li>Save the event</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Event Modification
                </h3>
                <p className="mb-2">Use the Drag mode to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Move existing events</li>
                  <li>Resize event areas</li>
                  <li>Edit event details</li>
                  <li>Delete events</li>
                </ul>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="font-semibold">Important:</p>
                <p>
                  Always double-check event configurations before saving, as
                  they directly affect tracking accuracy.
                </p>
              </div>
            </div>
          </section>

          {/* Dimensions */}
          <section
            id="dimensions"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Dimensions
            </h2>
            <p className="text-gray-600 mb-4">
              Dimensions provide additional context for your events. Common
              dimensions include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-4">
              <li>ListingId_GnafId</li>
              <li>ListingType</li>
              <li>State</li>
              <li>City</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="font-semibold">Note:</p>
              <p>
                Only select dimensions that are relevant to your event to
                maintain clean data.
              </p>
            </div>
          </section>

          {/* Best Practices */}
          <section
            id="best-practices"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Best Practices
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Use consistent naming conventions</li>
              <li>Keep screenshots up to date</li>
              <li>Regularly review and update event mappings</li>
              <li>Document any custom configurations</li>
              <li>Use appropriate event types for different interactions</li>
              <li>Maintain clear status updates</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section
            id="troubleshooting"
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Troubleshooting
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Common Issues
                </h3>
                <ul className="space-y-4">
                  <li>
                    <p className="font-semibold">Image Upload Fails:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>Check file size and format</li>
                      <li>Verify network connection</li>
                      <li>Ensure proper permissions</li>
                    </ul>
                  </li>
                  <li>
                    <p className="font-semibold">Event Creation Issues:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>Verify all required fields</li>
                      <li>Check dimension compatibility</li>
                      <li>Confirm event type selection</li>
                    </ul>
                  </li>
                  <li>
                    <p className="font-semibold">Drag Mode Problems:</p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-600">
                      <li>Toggle mode off/on</li>
                      <li>Refresh the page</li>
                      <li>Check browser compatibility</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="font-semibold">Need Help?</p>
                <p>
                  Contact your system administrator for technical support or
                  access issues.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <Link
            href="#"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowUp className="w-4 h-4 mr-2" />
            Back to Top
          </Link>
        </div>
      </div>
    </div>
  );
}
