import Link from 'next/link';
import { FiHome } from 'react-icons/fi';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-3 text-sm">
      <Link
        href="/screenshots"
        className="text-gray-500 hover:text-gray-700 inline-flex items-center transition-colors"
      >
        <FiHome className="h-4 w-4 mr-2" />
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <span className="text-gray-400">/</span>
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
