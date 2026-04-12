
import Login from './pages/Login.js'
import { Routes, Route } from 'react-router-dom';
import EmployeeWorkForm from './components/Employee/EmployeeWorkForm.js'
import LeavePermissionForm from './components/Employee/LeavePermissionForm.js';
import ProtectedRoute from './pages/ProtectedRoute.js';
import EmployeeNavbar from './components/Employee/EmployeeNavbar.js';
import ManagerDashboard from './components/Manager/ManagerDashboard.js';
import ManagerNavbar from './components/Manager/ManagerNavbar.js';
import WorkPivotTable from './components/Manager/WorkPivotTable.js';
import ViewRequests from './components/Manager/ViewRequests.js';
import ViewApprovedRequests from './components/AGM/ViewApprovedRequests.js';
import EmployeeManagementPage from './components/AGM/EmployeeManagementPage.js';
import ProjectAssignmentForm from './components/Manager/ProjectAssignmentForm.js';
import EmployeeManagement from './components/Manager/EmployeeManagement.js';
import UpdateProject from './components/Manager/UpdateProject.js';
import EditManagementPage from './components/AGM/EditManagementPage.js';
import AddEmployeeForm from './components/AGM/AddEmployeeForm.js';
import AddActivityForm from './components/AGM/AddActivityForm.js';
import AssignProjectForm from './components/AGM/AssignProjectForm.js';
import EditWorkDetails from './components/AGM/EditWorkDetails.js';
import AssignResources from './components/PC/AssignResources.js';
import LeaveDashboard from './components/Manager/LeaveDashboard.js';
import ProductivityDashboard from './components/Manager/ProductivityDashboard.js';

  const Unauthorized = () => (
  <div style={{ textAlign: "center", marginTop: "50px" }}>
    <h1>Access Denied 🚫</h1>
    <p>You do not have permission to view this page.</p>
  </div>
);

function App() {

  const employee = JSON.parse(sessionStorage.getItem("employee"));

  return (
    <div className="App">
      {employee && !employee.manager && !employee.tl &&employee?.designation !== "Assistant General Manager" && <EmployeeNavbar />}
{employee && employee.manager && employee?.designation !== "Assistant General Manager" && <ManagerNavbar />}
{employee && employee?.designation === "Assistant General Manager" && <ManagerNavbar />}
{employee && employee.tl && !employee.manager && employee?.designation !== "Assistant General Manager" &&<ManagerNavbar />}

      <Routes>
        <Route path="/" element={<Login />} />        
        <Route
  path="/manager/assign-project"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN" ]}>
      <EmployeeManagementPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/assign-tl"
  element={
    <ProtectedRoute>
      <ProjectAssignmentForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/leave-analysis"
  element={
    <ProtectedRoute>
      <LeaveDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/productivity-analysis"
  element={
    <ProtectedRoute>
      <ProductivityDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/pc/assign"
  element={
    <ProtectedRoute>
      <AssignResources />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/edit-workdetails"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN" ]}>
      <EditWorkDetails/>
    </ProtectedRoute>
  }
/>


<Route
  path="/manager/view-approved-request"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN","ROLE_MANAGER"]}>
      <ViewApprovedRequests />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/analysis"
  element={
    <ProtectedRoute allowedRoles={["ROLE_MANAGER",  "ROLE_ADMIN"]}>
      <WorkPivotTable />
    </ProtectedRoute>
  }
/>

<Route
    path="/manager/assign-tl"
    element={
      <ProtectedRoute allowedRoles={["ROLE_MANAGER"]}>
        <ProjectAssignmentForm />
      </ProtectedRoute>
    }
  />

<Route
  path="/manager/view-requests"
  element={
    <ProtectedRoute allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}>
      <ViewRequests />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/add-employee"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <AddEmployeeForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/add-project"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <AssignProjectForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/add-activity"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <AddActivityForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/view-employee"
  element={
    <ProtectedRoute>
      <EmployeeManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/update-project"
  element={
    <ProtectedRoute>
      <UpdateProject />
    </ProtectedRoute>
  }
/>

<Route
  path="/manager/edit-all"
  element={
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <EditManagementPage />
    </ProtectedRoute>
  }
/>

        <Route path="/employee/work" element={
      <ProtectedRoute excludedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}>
            <EmployeeWorkForm />
          </ProtectedRoute>} />
        <Route path="/employee/leave" element={      <ProtectedRoute excludedRoles={["ROLE_ADMIN"]}>
<LeavePermissionForm /></ProtectedRoute>} />
        <Route path="/manager/work" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN","ROLE_MANAGER" ]}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </div>
  );
}

export default App;
