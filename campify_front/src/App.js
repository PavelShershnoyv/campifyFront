import "./App.scss";
import Header from "./components/Header/Header";
import MainPage from "./components/MainPage/MainPage";
import Map from "./components/Map/Map";
import Footer from "./components/Footer/Footer";
import { Route, Routes } from "react-router-dom";
import RoutesPage from "./components/RoutesPage/RoutesPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="" element={<MainPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/map" element={<Map />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
