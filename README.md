# Doctor Management System(**SMART HEALTH**) - Patient Module

## **Features**

### **1. Registration & Profile Management**

- Secure sign-up/login via email or phone.
- Personal details: name, age, gender, contact info, address.
- Unique Patient ID / Health Card for identification.

### **2. Medical Records & History**

- Access doctor-uploaded prescriptions and lab results.
- Option to upload previous medical reports.
- ML-powered **health trend analysis** and predictive insights.

### **3. Appointment Booking**

- Search doctors by specialization, experience, and ratings.
- Book, reschedule, or cancel appointments.
- ML-based **smart scheduling** to reduce waiting times.

### **4. Telemedicine**

- Video/audio consultations with doctors.
- Symptom-based ML recommendations for suitable doctors.
- AI chatbot for health queries and basic treatment queries.

### **5. Prescription Management**

- Download prescriptions uploaded by doctors.
- ML-enabled **medication reminders** and **drug interaction alerts**.

### **6. Lab Tests & Reports**

- Schedule lab tests online.
- Track test status and download reports.
- ML-based **automated report analysis** for abnormal readings.

### **7. Notifications & Alerts**

- Appointment Reminders: SMS/email/in-app notifications.
- Prescription & Medication Alerts: ML-powered intelligent reminders.
- Health Tips: Personalized AI-generated health advice based on medical history.

### **8. Feedback & Ratings**

- Rate doctors and services.
- ML-based **sentiment analysis** to improve healthcare quality.

# 👨‍⚕️ Doctor Module – Doctor Management System

The **Doctor Module** is the core component where doctors manage appointments, review patient histories, validate AI-generated recommendations, and issue digital prescriptions.  
It provides a streamlined, user-friendly dashboard for doctors to deliver faster and more accurate consultations.

---

## ✨ Key Features

### 🔑 1. Authentication & Profile Management

- Secure login with **role-based access control**.
- Manage doctor profile: specialization, experience, contact info.
- Define availability schedule (days & time slots).
- Set consultation type (online/offline).

---

### 📅 2. Appointment Management

- **View Appointments** in daily/weekly calendar format.
- **Accept / Reject / Reschedule** patient appointments.
- View real-time patient queue (powered by Socket.IO/WebSockets).
- Mark appointments as **In Progress**, **Completed**, or **Cancelled**.

---

### 🩺 3. Patient History Access

- View detailed patient profile:
  - Basic info (age, gender, allergies)
  - Past medical history & prescriptions
  - Uploaded lab reports
- Quick patient search by ID or name.
- Download or print previous prescriptions.

---

### 🧠 4. ML-Powered Assistance

- Review **voice-to-text converted symptoms** entered by patient.
- Get AI-suggested:
  - Possible diseases (ranked by confidence)
  - Recommended medicines
- **Doctor validates** and edits before finalizing.
- Feedback option to improve model performance over time.

---

### 📝 5. Digital Prescription Management

- Create prescriptions digitally or auto-generate from ML suggestions.
- Attach lab tests & medical advice.
- Digitally sign prescriptions.
- Store prescription automatically in patient record.
- Notify patient when prescription is available.

---

### 💬 6. Patient Communication

- Send follow-up reminders or medical advice.
- Secure communication through notifications or email.
- Notify patient if appointment needs rescheduling.

---

### 📊 7. Doctor Dashboard & Analytics

- View:
  - Total patients for the day/week.
  - Pending, confirmed, and completed consultations.
  - Disease trends & most common cases.
- Export reports for hospital administration.

# 🛠️ Admin Module – Doctor Management System

The **Admin Module** is the control center of the Doctor Management System.  
It allows administrators to manage doctors, receptionists, patients, appointments, notifications, and system-wide settings — ensuring smooth operations across the entire platform.

---

## ✨ Key Features

### 🔑 1. Authentication & Role Management

- Secure **Admin login** with elevated privileges.
- Create and manage roles:
  - **Doctor**
  - **Receptionist**
  - **Patient**
- Activate/deactivate user accounts when needed.

---

### 👨‍⚕️ 2. Doctor Management

- Add new doctors with details:
  - Name, specialization, experience
  - Availability schedule
  - Consultation type (online/offline)
- Update or remove doctor profiles.
- Monitor doctor performance (appointments completed, patient feedback).

---

### 🧑‍💼 3. Receptionist Management

- Create and manage receptionist accounts.
- Assign receptionists to specific doctors/clinics.
- Track appointment activity handled by each receptionist.

---

### 👤 4. Patient Management

- View and manage patient profiles.
- Access complete patient history (only for authorized admin use).
- Option to delete or deactivate patient accounts if needed.

---

### 📅 5. Appointment Oversight

- View all appointments across doctors and receptionists.
- Filter by:
  - Doctor
  - Date range
  - Status (pending, confirmed, completed)
- Force-cancel or reassign appointments if necessary.

---

### ⚙️ 6. System Configuration

- Manage clinic/hospital profile (name, address, logo).
- Configure:
  - Working hours
  - Holidays
  - Appointment rules (e.g., max patients per day)
- Manage notification templates (appointment confirmation, reminders).

---

### 📊 7. Analytics & Reports

- View key metrics on admin dashboard:
  - Total number of doctors, receptionists, and patients
  - Appointments booked per day/week/month
  - Most common diseases (from prescriptions)
- Export reports in CSV/PDF for management use.

---

### 🧠 8. ML Model Monitoring

- Monitor AI model performance (accuracy of disease prediction).
- View logs of ML-suggested prescriptions.
- Trigger model retraining by uploading new data.

---

### 🔔 9. Notification Management

- Send **broadcast messages** to all users (e.g., clinic holiday notice).
- Send **targeted notifications** to specific groups:
  - All doctors
  - All receptionists
  - Patients of a specific doctor

---

### 🛡️ 10. Security & Logs

- View activity logs (doctor logins, prescription edits, patient updates).
- Manage data backup & restore.
- Control access permissions for sensitive operations.

# 🧑‍💼 Receptionist Module – Doctor Management System

The **Receptionist Module** acts as the bridge between patients and doctors.  
Receptionists manage patient records, handle appointment scheduling, manage the patient queue, and keep both patients and doctors updated — ensuring smooth clinic/hospital operations.

---

## ✨ Key Features

### 🔑 1. Authentication & Profile Management

- Secure login with **role-based access control**.
- Update receptionist profile (name, contact details).
- View assigned doctors/clinics (if working in a multi-doctor setup).

---

### 👤 2. Patient Record Management

- Register new patients with basic details:
  - Name, age, gender, contact info
  - Allergies & blood group (if provided)
- Update existing patient records.
- Search for patients by name, ID, or contact number.

---

### 📅 3. Appointment Scheduling

- Book appointments on behalf of patients (walk-in or phone calls).
- Reschedule or cancel appointments when required.
- Assign patients to doctors based on specialization & availability.
- Ensure no double-booking or overlap in appointments.

---

### 🪑 4. Queue Management

- Maintain **real-time patient queue**.
- Mark patient status as:
  - Waiting
  - In Consultation
  - Completed
- Update doctors on patient readiness.
- Handle priority cases (emergency patients).

---

### 🔔 5. Notifications & Communication

- Notify patients about:
  - Appointment confirmation or cancellation
  - Doctor delays or rescheduling
- Send reminders for upcoming appointments.
- Notify doctors about urgent cases or walk-ins.

---

### 📊 6. Dashboard & Activity Tracking

- View today’s appointments per doctor.
- Track number of patients handled daily.
- View pending and completed consultations.
- Generate simple reports for the admin.

---

### ⚙️ 7. Coordination with Doctors & Admin

- Inform doctors about last-minute changes.
- Coordinate with admin for schedule updates.
- Escalate issues like patient complaints or no-shows.

## **Technology Stack**

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication** JWT + Role-Based Access Control, OAuth
- **Reports** CSV/PDF generation using reportlab / jsPDF
- **ML Tools:** Python (scikit-learn, TensorFlow, PyTorch)
- **Notifications:** Firebase / Twilio
- **Real-Time Updates** Socket.IO
- **PDF Prescription** reportlab / docx
- **Voice-to-Text** OpenAI Whisper / Google Speech-to-Text
- **ML Model** Fine-tuned BERT / DistilBERT for symptom-disease prediction
