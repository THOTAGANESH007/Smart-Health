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
import CreateLabTest from "./components/labtests/CreateLabTest";
import UpdateLabTest from "./components/labtests/UpdateLabTest";
import PatientLabTests from "./components/labtests/PatientLabTests";
import PatientPrescriptions from "./components/prescriptions/PatientPrescriptions";
import CreatePrescription from "./components/prescriptions/CreatePrescription";
import Header from "./components/Header";
import PatientHomepage from "./components/PatientHomepage";
import DoctorHomepage from "./components/DoctorHomepage";
import AdminHomepage from "./components/AdminHomepage";
import Feedback from "./components/FeedBack";
import MyFeedback from "./components/MyFeedback";
import ManageDoctors from "./components/ManageDoctors";
import HealthCard from "./components/HealthCard";
import DoctorList from "./components/video/DoctorList";
import IncomingCallPopup from "./components/video/IncomingCallPopup";
import AllHealthCards from "./components/AllHealthCards";
import UpdatePatientHealthCards from "./components/UpdatePatientHealthCards";
import AllPatientsHealthCards from "./components/AllPatientsHealthCards";
import DoctorFeedbacks from "./components/DoctorFeedbacks";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Routes>
        <Route path="/patient" element={<PatientHomepage />}>
          <Route path="app-patient" element={<PatientAppointments />} />
          {/* <Route path="video" element={<CallComponent />} /> */}
          <Route path="chat" element={<Chat />} />
           <Route path="healthcard" element={<HealthCard />} />
          <Route path="feedback" element={<MyFeedback />} />
          <Route path="pres-patient" element={<PatientPrescriptions />} />
          <Route path="lab-patient-test" element={<PatientLabTests />} />
          <Route path="myappointments" element={<GetPatientAppointments />} />
          <Route path="list" element={<DoctorList />} />
          <Route path="call/:roomId" element={<CallComponent />} />
        </Route>

        <Route path="/doctor" element={<DoctorHomepage />}>
          <Route path="app-doctor" element={<DoctorAppointments />} />
          <Route path="healthcards" element={<AllHealthCards />} />
          <Route path="update-patient/:id" element={<UpdatePatientHealthCards />} />
          {/* <Route path="video" element={<CallComponent />} /> */}
           <Route path="call/:roomId" element={<CallComponent />} />
          <Route path="pres-create" element={<CreatePrescription />} />
          <Route path="lab-update" element={<UpdateLabTest />} />
          <Route path="lab-create" element={<CreateLabTest />} />
          <Route path="popup" element={<IncomingCallPopup />} />
           <Route path="myfeedback" element={<DoctorFeedbacks />} />
          {/* <Route path="myappointments" element={<GetPatientAppointments />} /> */}
        </Route>

        <Route path="/admin" element={<AdminHomepage />}>
          <Route path="dashboard" element={<AnalyticsDashboard />} />
          <Route path="app-admin" element={<AdminAppointments />} />
          <Route path="allhealthcards" element={<AllPatientsHealthCards />} />
          <Route path="manage-doctors" element={<ManageDoctors />} />
          <Route
            path="send-notification"
            element={<AdminNotificationSender />}
          />
          <Route
            path="schedule-notification"
            element={<ScheduleNotification />}
          />
          <Route path="scheduled-list" element={<NotificationList />} />

          {/* <Route path="myappointments" element={<GetPatientAppointments />} /> */}
        </Route>

        {/* <Route path="/pat-home" element={<PatientHomepage/>}/> */}
        <Route path="/" element={<HospitalLanding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/analytics" element={<AnalyticsDashboard />} /> */}
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-user" element={<UpdateUser />} />
        {/* <Route path="/chat" element={<Chat />} />
        <Route path="/video" element={<CallComponent />} /> */}
        <Route path="/doctor-search" element={<DoctorSearch />} />
        <Route path="/patient-search" element={<PatientSearch />} />
        {/* <Route path="/app-patient" element={<PatientAppointments />} /> */}
        {/* <Route path="/app-doctor" element={<DoctorAppointments />} /> */}
        {/* <Route path="/app-admin" element={<AdminAppointments />} /> */}
        {/* <Route path="/get-app-patient" element={<GetPatientAppointments />} /> */}
        {/* <Route path="/lab-create" element={<CreateLabTest />} /> */}
        {/* <Route path="/lab-update" element={<UpdateLabTest />} /> */}
        {/* <Route path="/lab-patient-tests" element={<PatientLabTests />} /> */}
        {/* <Route path="/pres-patient" element={<PatientPrescriptions />} /> */}
        {/* <Route path="/pres-create" element={<CreatePrescription />} /> */}
        {/* <Route
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
        /> */}

        {/* <Route path="/list" element={<DoctorList />} />
        <Route path="/popup" element={<IncomingCallPopup />} />
        <Route path="/call/:roomId" element={<CallComponent />} /> */}
      </Routes>

      {/* Toast Notifications (Global) */}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
