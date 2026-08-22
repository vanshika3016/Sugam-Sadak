import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'
import { CitizenShell } from '@/layouts/CitizenShell'
import { ContractorShell } from '@/layouts/ContractorShell'
import { GovShell } from '@/layouts/GovShell'
import { LoginPage } from '@/pages/auth/LoginPage'
import { CitizenHomePage } from '@/pages/citizen/CitizenHomePage'
import { ReportHazardPage } from '@/pages/citizen/ReportHazardPage'
import { ReportSuccessPage } from '@/pages/citizen/ReportSuccessPage'
import { MyReportsPage } from '@/pages/citizen/MyReportsPage'
import { ReportDetailPage } from '@/pages/citizen/ReportDetailPage'
import { ExploreMapPage } from '@/pages/citizen/ExploreMapPage'
import { CitizenRoadPassportWrapper, GovernmentRoadPassportWrapper } from '@/features/passport/RoadPassportWrapper'
import { GovernmentOverviewPage } from '@/pages/government/GovernmentOverviewPage'
import { CaseManagementPage } from '@/pages/government/CaseManagementPage'
import { GovernmentCaseDetailPage } from '@/pages/government/GovernmentCaseDetailPage'
import { GovernmentInspectionsPage } from '@/pages/government/GovernmentInspectionsPage'
import { InspectionDetailPage } from '@/pages/government/InspectionDetailPage'
import { ContractorDashboardPage } from '@/pages/contractor/ContractorDashboardPage'
import { ContractorTasksPage } from '@/pages/contractor/ContractorTasksPage'
import { ContractorTaskDetailPage } from '@/pages/contractor/ContractorTaskDetailPage'
import { RepairSubmissionPage } from '@/pages/contractor/RepairSubmissionPage'
import { PlaceholderPage } from '@/pages/shared/PlaceholderPage'
import { Navigate, createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute allowedRoles={['citizen']} />,
    children: [
      {
        element: <CitizenShell />,
        children: [
          { path: '/citizen/home', element: <CitizenHomePage /> },
          { path: '/citizen/report', element: <ReportHazardPage /> },
          { path: '/citizen/report/success/:reportId', element: <ReportSuccessPage /> },
          { path: '/citizen/reports', element: <MyReportsPage /> },
          { path: '/citizen/reports/:reportId', element: <ReportDetailPage /> },
          { path: '/citizen/map', element: <ExploreMapPage /> },
          { path: '/citizen/passport/:roadId', element: <CitizenRoadPassportWrapper /> },
          { path: '/citizen/notifications', element: <PlaceholderPage title="Notifications" phase="Future" /> },
          { path: '/citizen/profile', element: <PlaceholderPage title="Profile" phase="Future" /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['government']} />,
    children: [
      {
        element: <GovShell />,
        children: [
          { path: '/government/overview', element: <GovernmentOverviewPage /> },
          { path: '/government/cases', element: <CaseManagementPage /> },
          { path: '/government/cases/:reportId', element: <GovernmentCaseDetailPage /> },
          { path: '/government/inspections', element: <GovernmentInspectionsPage /> },
          { path: '/government/inspections/:inspectionId', element: <InspectionDetailPage /> },
          { path: '/government/map', element: <PlaceholderPage title="Operations Map" phase="Future" /> },
          { path: '/government/assets', element: <PlaceholderPage title="Road Asset Registry" phase="Future" /> },
          { path: '/government/contractors', element: <PlaceholderPage title="Contractor Management" phase="Future" /> },
          { path: '/government/analytics', element: <PlaceholderPage title="Analytics & Reports" phase="Future" /> },
          { path: '/government/passport/:roadId', element: <GovernmentRoadPassportWrapper /> },
          { path: '/government/notifications', element: <PlaceholderPage title="Notifications & Action Center" phase="Future" /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['contractor']} />,
    children: [
      {
        element: <ContractorShell />,
        children: [
          { path: '/contractor/dashboard', element: <ContractorDashboardPage /> },
          { path: '/contractor/tasks', element: <ContractorTasksPage /> },
          { path: '/contractor/tasks/:taskId', element: <ContractorTaskDetailPage /> },
          { path: '/contractor/tasks/:taskId/repair', element: <RepairSubmissionPage /> },
          { path: '/contractor/tasks/:taskId/inspection', element: <PlaceholderPage title="Inspection Result" phase="Future" /> },
          { path: '/contractor/history', element: <PlaceholderPage title="Task History" phase="Future" /> },
          { path: '/contractor/dlp', element: <PlaceholderPage title="DLP Exposure" phase="Future" /> },
          { path: '/contractor/profile', element: <PlaceholderPage title="Profile" phase="Future" /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
