import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, Select } from "antd";
import moment from "moment";

const BookingFormModal = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [meetingOption, setMeetingOption] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("room");
      if (storedData) {
        setMeetingOption(JSON.parse(storedData)); 
      }
    }
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        dateTime: initialValues.dateTime ? moment(initialValues.dateTime) : null,
      });
    }
  }, [initialValues, form]);

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={initialValues ? "Edit Booking" : "Add Booking"}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Meeting Type"
          name="meetingType"
          rules={[{ required: true, message: 'Please select a meeting type' }]}
        >
          <Select placeholder="Select Meeting Type">
            {meetingOption?.length > 0 && meetingOption.map((item) => {
              return (
                <Option value={item.key}>{item.name}</Option>
              )
            })}
          </Select>
        </Form.Item>

        <Form.Item
          label="Meeting Title"
          name="meetingTitle"
          rules={[{ required: true, message: 'Please input the meeting title' }]}
        >
          <Input placeholder="Enter meeting title" />
        </Form.Item>

        <Form.Item
          label="Meeting Description"
          name="meetingDescription"
          rules={[{ required: true, message: 'Please provide a description for the meeting' }]}
        >
          <Input.TextArea placeholder="Enter meeting description" />
        </Form.Item>

        <Form.Item
          label="Choose Date"
          name="meetingDate"
          rules={[{ required: true, message: 'Please select the meeting date' }]}
        >
          <DatePicker
            format="YYYY-MM-DD"
            placeholder="Select meeting date"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Choose Date and Time"
          name="meetingDateTime"
          rules={[{ required: true, message: 'Please select the meeting date and time' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Select date and time"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookingFormModal;
