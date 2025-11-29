import VisualizationPage from "src/pages/VisualizationPage";

import { Navigate } from "react-router";
import { Route, Routes } from "react-router";

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/visualization/generation" replace />}
      />
      <Route path="/visualization/generation" element={<VisualizationPage />} />
      <Route
        path="/visualization/path-finding"
        element={<VisualizationPage />}
      />
    </Routes>
  );
}

export default AppRouter;
