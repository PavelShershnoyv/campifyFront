import "./App.scss";
import Header from "./components/Header/Header";
import MainPage from "./components/MainPage/MainPage";
import Map from "./components/Map/Map";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="" element={<MainPage />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </div>
  );
}

export default App;
