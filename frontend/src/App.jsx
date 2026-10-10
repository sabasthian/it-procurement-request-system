import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import RequestDetail from "./pages/RequestDetail";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/requests/new"
                    element={<NewRequest />}
                />

                <Route
                    path="/requests/:id"
                    element={<RequestDetail />}
                />

                <Route
                    path="/supervisor"
                    element={<SupervisorDashboard />}
                />

                <Route
                    path="/procurement"
                    element={<ProcurementDashboard />}
                />

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
