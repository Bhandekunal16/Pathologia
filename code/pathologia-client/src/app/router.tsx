import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { RoleRoute } from '../routes/RoleRoute';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const UserListPage = lazy(() => import('../pages/UserListPage').then((m) => ({ default: m.UserListPage })));
const CreateUserPage = lazy(() => import('../pages/CreateUserPage').then((m) => ({ default: m.CreateUserPage })));
const EditUserPage = lazy(() => import('../pages/EditUserPage').then((m) => ({ default: m.EditUserPage })));
const ViewUserPage = lazy(() => import('../pages/ViewUserPage').then((m) => ({ default: m.ViewUserPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const SuspenseFallback = () => (
  <div className="flex h-64 items-center justify-center">
    <LoadingSpinner size="lg" label="Loading application section..." />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            element: <RoleRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                path: 'users',
                element: (
                  <Suspense fallback={<SuspenseFallback />}>
                    <UserListPage />
                  </Suspense>
                ),
              },
              {
                path: 'users/new',
                element: (
                  <Suspense fallback={<SuspenseFallback />}>
                    <CreateUserPage />
                  </Suspense>
                ),
              },
              {
                path: 'users/:id',
                element: (
                  <Suspense fallback={<SuspenseFallback />}>
                    <ViewUserPage />
                  </Suspense>
                ),
              },
              {
                path: 'users/:id/edit',
                element: (
                  <Suspense fallback={<SuspenseFallback />}>
                    <EditUserPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: '403',
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <ForbiddenPage />
              </Suspense>
            ),
          },
          {
            path: '*',
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <NotFoundPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
