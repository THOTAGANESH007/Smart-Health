import "./App.css";
import { Routes, Route } from "react-router-dom";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOTP from "./components/auth/VerifyOTP";
import ResetPassword from "./components/auth/ResetPassword";
import UpdateUser from "./components/user/UpdateUser";
import SignIn from "./components/auth/SignIn";
import Signup from "./components/auth/Signup";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Chat from "./components/gpt/Chat";
import CallComponent from "./components/video/CallComponent";
import DoctorSearch from "./components/search/DoctorSearch";
import PatientSearch from "./components/search/PatientSearch";
import AdminNotificationSender from "./components/notifications/AdminNotificationSender";
import ScheduleNotification from "./components/remainders/ScheduleNotification";
import NotificationList from "./components/remainders/NotificationList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HospitalLanding from "./components/HospitalLanding";
import GetPatientAppointments from "./components/appointments/GetPatientAppointments";
import PatientAppointments from "./components/appointments/PatientAppointments";
import AdminAppointments from "./components/appointments/AdminAppointments";
import DoctorAppointments from "./components/appointments/DoctorAppointments";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Routes>
        <Route path="/" element={<HospitalLanding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-user" element={<UpdateUser />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/video" element={<CallComponent />} />
        <Route path="/doctor-search" element={<DoctorSearch />} />
        <Route path="/patient-search" element={<PatientSearch />} />
        <Route path="/app-patient" element={<PatientAppointments />} />
        <Route path="/app-doctor" element={<DoctorAppointments />} />
        <Route path="/app-admin" element={<AdminAppointments />} />
        <Route path="/get-app-patient" element={<GetPatientAppointments />} />
        <Route
          path="/admin-send-notification"
          element={<AdminNotificationSender />}
        />
        <Route
          path="/schedule-notification"
          element={
            <div>
              <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
                Admin Notification Scheduler
              </h1>
              <ScheduleNotification />
            </div>
          }
        />
        <Route
          path="/scheduled-list"
          element={
            <div>
              <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
                Scheduled Notifications
              </h1>
              <NotificationList />
            </div>
          }
        />
      </Routes>

      {/* Toast Notifications (Global) */}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
