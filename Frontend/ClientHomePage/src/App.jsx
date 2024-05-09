import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./components/authentication/logIn/LogIn";
import MainMenu from "./pages/menu/MainMenu";
import NavBar from "./layOut/navbar/NavBar";
import Chat from "./pages/chat/Chat";
import Footer from "./layOut/footer/Footer";
import About from "./pages/about/About";
import Register from "./components/authentication/register/Register";
import "./App.css";

function App() {
  const user = localStorage.getItem("userName");

  return (
    <>
      <NavBar />
      <Container className="text-secondary">
        <Routes>
          <Route path="/" element={user ? <MainMenu /> : <LogIn />} />
          <Route
            path="/register"
            element={user ? <MainMenu /> : <Register />}
          />
          <Route path="/chat/:userName" element={user ? <Chat /> : <LogIn />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
}

export default App;
