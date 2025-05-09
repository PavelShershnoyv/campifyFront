import "./App.scss";
import Header from "./components/Header/Header";
import MainPage from "./components/MainPage/MainPage";
import Map from "./components/Map/Map";
import Footer from "./components/Footer/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
import RoutesPage from "./components/RoutesPage/RoutesPage";
import MyRoutesPage from "./components/MyRoutesPage/MyRoutesPage";
import Scheduler from "./components/Scheduler/Scheduler";
import CardRoute from "./components/CardRoute/CardRoute";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import AuthPage from "./components/AuthPage/AuthPage";

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/registration" || location.pathname === "/login";

  return (
    <div className="App">
      <Routes>
        <Route path="" element={<MainPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/my-routes" element={<MyRoutesPage />} />
        {/* <Route path="/map" element={<Map />} /> */}
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/route-details/:id" element={<CardRoute />} />
        <Route path="/registration" element={<RegisterPage />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
