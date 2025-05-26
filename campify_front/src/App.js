import "./App.scss";
import Header from "./components/Header/Header";
import MainPage from "./components/MainPage/MainPage";
import Map from "./components/Map/Map";
import Footer from "./components/Footer/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
import RoutesPage from "./components/RoutesPage/RoutesPage";
import MyRoutesPage from "./components/MyRoutesPage/MyRoutesPage";
import RecommendationsPage from "./components/RecommendationsPage/RecommendationsPage";
import PreferencesSurveyPage from "./components/PreferencesSurveyPage/PreferencesSurveyPage";
import Scheduler from "./components/Scheduler/Scheduler";
import CardRoute from "./components/CardRoute/CardRoute";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import AuthPage from "./components/AuthPage/AuthPage";
import AboutUsPage from "./components/AboutUsPage/AboutUsPage";
import Moderation from "./components/Moderation/Moderation";
import AdminRoute from "./components/ProtectedRoute/AdminRoute";
import AdminRedirect from "./components/ProtectedRoute/AdminRedirect";
import PrivateRoute from "./components/ProtectedRoute/PrivateRoute";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/registration" || location.pathname === "/login";
  const isModerationPage = location.pathname === "/moderation";
  const shouldShowHeaderFooter = !isAuthPage && !isModerationPage;

  return (
    <div className="App">
      <AdminRedirect />
      
      <Routes>
        <Route path="" element={<MainPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/my-routes" element={<PrivateRoute element={<MyRoutesPage />} />} />
        <Route path="/recommendations" element={<PrivateRoute element={<RecommendationsPage />} />} />
        <Route path="/preferences-survey" element={<PreferencesSurveyPage />} />
        {/* <Route path="/map" element={<Map />} /> */}
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/route-details/:id" element={<CardRoute />} />
        <Route path="/registration" element={<RegisterPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/moderation" element={<AdminRoute element={<Moderation />} />} />
      </Routes>
      {shouldShowHeaderFooter && <Footer />}
    </div>
  );
}

export default App;
