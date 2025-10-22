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

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Lets start</h1>} />
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
      <Route
        path="/admin-send-notification"
        element={<AdminNotificationSender />}
      />
    </Routes>
  );
}

export default App;
