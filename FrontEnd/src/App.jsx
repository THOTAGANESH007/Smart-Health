import "./App.css";
import {  Routes, Route } from "react-router-dom";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOTP from "./components/auth/VerifyOTP";
import ResetPassword from "./components/auth/ResetPassword";
import UpdateUser from "./components/user/UpdateUser";
import SignIn from "./components/auth/SignIn";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<h1>Lets start</h1>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path='/login' element={<SignIn/>}/>
        <Route path="/reset-password" element={<ResetPassword />} />
         <Route path="/update-user" element={<UpdateUser />} />
      </Routes>
    
  );
}

export default App;