import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentAppShell } from '@/components/student/layout/StudentAppShell';
import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import CollegesPage from '@/pages/public/CollegesPage';
import PackagesPage from '@/pages/public/PackagesPage';
import SuccessStoriesPage from '@/pages/public/SuccessStoriesPage';
import ContactPage from '@/pages/public/ContactPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminTrainers from '@/pages/admin/AdminTrainers';
import AdminApplications from '@/pages/admin/AdminApplications';
import AdminColleges from '@/pages/admin/AdminColleges';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminPackages from '@/pages/admin/AdminPackages';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminDocuments from '@/pages/admin/AdminDocuments';
import AdminAudit from '@/pages/admin/AdminAudit';
import TrainerDashboard from '@/pages/trainer/TrainerDashboard';
import TrainerStudents from '@/pages/trainer/TrainerStudents';
import TrainerApplications from '@/pages/trainer/TrainerApplications';
import TrainerPreparation from '@/pages/trainer/TrainerPreparation';
import TrainerSessions from '@/pages/trainer/TrainerSessions';
import TrainerColleges from '@/pages/trainer/TrainerColleges';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentApplications from '@/pages/student/StudentApplications';
import StudentPreparation from '@/pages/student/StudentPreparation';
import StudentDocuments from '@/pages/student/StudentDocuments';
import StudentPayments from '@/pages/student/StudentPayments';
import StudentUniversities from '@/pages/student/StudentUniversities';
import StudentUniversityDetail from '@/pages/student/StudentUniversityDetail';
import StudentCompare from '@/pages/student/StudentCompare';
import StudentPrograms from '@/pages/student/StudentPrograms';
import StudentEvents from '@/pages/student/StudentEvents';
import StudentResources from '@/pages/student/StudentResources';
import StudentMentors from '@/pages/student/StudentMentors';
import StudentPackages from '@/pages/student/StudentPackages';
import StudentProfile from '@/pages/student/StudentProfile';
import StudentSettings from '@/pages/student/StudentSettings';
import StudentOnboarding from '@/pages/onboarding/StudentOnboarding';
import { StudentOnboardingGuard } from '@/components/onboarding/StudentOnboardingGuard';
import TrainerDocuments from '@/pages/trainer/TrainerDocuments';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

function ProtectedRoute({ children, role }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="colleges" element={<CollegesPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="success-stories" element={<SuccessStoriesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <DashboardLayout role="ADMIN" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="trainers" element={<AdminTrainers />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="colleges" element={<AdminColleges />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        <Route
          path="/trainer"
          element={
            <ProtectedRoute role="TRAINER">
              <DashboardLayout role="TRAINER" />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrainerDashboard />} />
          <Route path="students" element={<TrainerStudents />} />
          <Route path="applications" element={<TrainerApplications />} />
          <Route path="preparation" element={<TrainerPreparation />} />
          <Route path="sessions" element={<TrainerSessions />} />
          <Route path="documents" element={<TrainerDocuments />} />
          <Route path="colleges" element={<TrainerColleges />} />
        </Route>

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentOnboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentOnboardingGuard />
            </ProtectedRoute>
          }
        >
          <Route element={<StudentAppShell />}>
          <Route index element={<StudentDashboard />} />
          <Route path="universities" element={<StudentUniversities />} />
          <Route path="universities/compare" element={<StudentCompare />} />
          <Route path="universities/:slug" element={<StudentUniversityDetail />} />
          <Route path="programs" element={<StudentPrograms />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="resources" element={<StudentResources />} />
          <Route path="mentors" element={<StudentMentors />} />
          <Route path="packages" element={<StudentPackages />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="preparation" element={<StudentPreparation />} />
          <Route path="documents" element={<StudentDocuments />} />
          <Route path="payments" element={<StudentPayments />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
