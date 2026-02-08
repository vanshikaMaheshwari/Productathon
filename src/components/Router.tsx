import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import HomePage from '@/components/pages/HomePage';
import LeadsPage from '@/components/pages/LeadsPage';
import LeadDetailPage from '@/components/pages/LeadDetailPage';
import DashboardPage from '@/components/pages/DashboardPage';
import SourcesPage from '@/components/pages/SourcesPage';
import StatesPage from '@/components/pages/StatesPage';
import CreateLeadPage from '@/components/pages/CreateLeadPage';
import FeedbackManagementPage from '@/components/pages/FeedbackManagementPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
        routeMetadata: {
          pageIdentifier: 'home',
        },
      },
      {
        path: "leads",
        element: <LeadsPage />,
        routeMetadata: {
          pageIdentifier: 'leads',
        },
      },
      {
        path: "leads/:id",
        element: <LeadDetailPage />,
        routeMetadata: {
          pageIdentifier: 'lead-detail',
        },
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
        routeMetadata: {
          pageIdentifier: 'dashboard',
        },
      },
      {
        path: "sources",
        element: <SourcesPage />,
        routeMetadata: {
          pageIdentifier: 'sources',
        },
      },
      {
        path: "states",
        element: <StatesPage />,
        routeMetadata: {
          pageIdentifier: 'states',
        },
      },
      {
        path: "create-lead",
        element: <CreateLeadPage />,
        routeMetadata: {
          pageIdentifier: 'create-lead',
        },
      },
      {
        path: "feedback",
        element: <FeedbackManagementPage />,
        routeMetadata: {
          pageIdentifier: 'feedback-management',
        },
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
