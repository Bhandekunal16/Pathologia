import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems }) => {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ label: 'Dashboard', path: '/dashboard' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (segment === 'dashboard') return;
      currentPath += `/${segment}`;

      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (segment === 'users') label = 'Users Management';
      if (segment === 'new') label = 'Create User';
      if (segment === 'edit') label = 'Edit User';
      if (segment === 'profile') label = 'My Profile';
      if (segment === 'request-response') label = 'Request & Response';
      if (segment === 'pathology-tests') label = 'Pathology Tests';
      if (segment === 'invite-user') label = 'Invite User';

      // Handle user IDs like 'user-123'
      if (segment.startsWith('user-') || !isNaN(Number(segment))) {
        label = 'User Details';
      }

      items.push({
        label,
        path: index === pathSegments.length - 1 ? undefined : currentPath,
      });
    });

    return items;
  };

  const items = getBreadcrumbs();

  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 py-1" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400 shrink-0" />}
            {index === 0 && (
              <Home className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
            )}
            {item.path ? (
              <Link
                to={item.path}
                className="hover:text-teal-700 transition-colors duration-150"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-800 font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
