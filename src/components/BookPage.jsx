import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Space } from "antd";
import moment from "moment";
import BookingFormModal from "./BookModal";

const BookingsPage = () => {
  const [bookings, setBookings] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('bookings'))
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    setBookings(storedBookings);
  }, []);

  const handleAddOrUpdateBooking = (values) => {
    let updatedBookings;
    if (editingBooking) {
      updatedBookings = bookings.map((booking) =>
        booking.key === editingBooking.key ? { ...booking, ...values } : booking
      );
    } else {
      updatedBookings = [...bookings, { ...values, key: Date.now() }];
    }

    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleDeleteBooking = (key) => {
    const updatedBookings = bookings.filter((booking) => booking.key !== key);
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
  };

  const columns = [
    {
      title: "Booking Title",
      dataIndex: "meetingTitle",
    },
    {
      title: "Date & Time",
      dataIndex: "meetingDate",
      render: (meetingDate) => {
        return (
          <div>
            {meetingDate && moment(meetingDate).format("DD-MM-YYYY")}
          </div>
        );
      }
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => { setEditingBooking(record); setIsModalOpen(true); }}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this booking?"
            onConfirm={() => handleDeleteBooking(record.key)}
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => { setIsModalOpen(true); setEditingBooking(null); }}>
        Add Booking
      </Button>
      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="key"
        style={{ marginTop: 20 }}
      />
      <BookingFormModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleAddOrUpdateBooking}
        initialValues={editingBooking}
        existingBookings={bookings}
      />
    </div>
  );
};

export default BookingsPage;
