import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import RoomPage from "../src/components/RoomsPage";
import BookModal from "../src/components/BookPage";

const { Header, Content } = Layout;

function App() {

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ background: "#fff", padding: 0 }}>
          <Menu mode="horizontal">
            <Menu.Item key="rooms">
              <Link to="/rooms">Rooms</Link>
            </Menu.Item>
            <Menu.Item key="bookings">
              <Link to="/bookings">Bookings</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Layout>
          <Content style={{ padding: "0 50px", marginTop: 64 }}>
            <Routes>
              <Route path="/rooms" element={<RoomPage />} />
              <Route path="/bookings" element={<BookModal />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App
