import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ContentStudio from "./pages/ContentStudio";
import LeadsCRM from "./pages/LeadsCRM";
import LeadDetail from "./pages/LeadDetail";
import ReviewTasks from "./pages/ReviewTasks";
import Notifications from "./pages/Notifications";
import SkillsTemplates from "./pages/SkillsTemplates";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workbench" replace />} />
      <Route element={<Layout />}>
        <Route path="/workbench" element={<Dashboard />} />
        <Route path="/workbench/content" element={<ContentStudio />} />
        <Route path="/workbench/leads" element={<LeadsCRM />} />
        <Route path="/workbench/leads/:id" element={<LeadDetail />} />
        <Route path="/workbench/review-tasks" element={<ReviewTasks />} />
        <Route path="/workbench/notifications" element={<Notifications />} />
        <Route path="/workbench/skills" element={<SkillsTemplates />} />
        <Route path="/workbench/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
