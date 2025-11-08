import React, { useState, useEffect } from "react";
import { Table, Button,  Popconfirm, Space } from "antd";
import RoomFormModal from "./RoomModal";

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    const storedRooms = JSON.parse(localStorage.getItem("rooms")) || [];
    setRooms(storedRooms);
  }, []);

  const handleAddOrUpdateRoom = (values) => {
    let updatedRooms;
    if (editingRoom) {
      updatedRooms = rooms.map((room) =>
        room.key === editingRoom.key ? { ...room, ...values } : room
      );
    } else {
      updatedRooms = [...rooms, { ...values, key: Date.now() }];
    }

    setRooms(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (key) => {
    const updatedRooms = rooms.filter((room) => room.key !== key);
    setRooms(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
  };

  const columns = [
    {
      title: "Room Name",
      dataIndex: "name",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => { setEditingRoom(record); setIsModalOpen(true); }}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this room?"
            onConfirm={() => handleDeleteRoom(record.key)}
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        Add Room
      </Button>
      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="key"
        style={{ marginTop: 20 }}
      />
      <RoomFormModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAddOrUpdateRoom}
        initialValues={editingRoom}
      />
    </div>
  );
};

export default RoomsPage;
