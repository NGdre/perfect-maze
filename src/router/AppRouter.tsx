import { Navigate } from "react-router";
import { Route, Routes } from "react-router";
import VisualizationPage from "src/pages/VisualizationPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/visualization" replace />} />
      <Route path="/visualization" element={<VisualizationPage />} />
    </Routes>
  );
}

export default AppRouter;
