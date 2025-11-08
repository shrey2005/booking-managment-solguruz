import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, Select, message, TimePicker } from "antd";
import moment from "moment";

const { Option } = Select;

const checkConflict = (roomType, startTime, endTime, date, existingBookings, initialValues) => {
  const newStart = moment(startTime);
  const newEnd = moment(endTime);
  const selectedDate = moment(date).format("YYYY-MM-DD");
  console.log({
    roomType,
    startTime,
    endTime,
    date,
    existingBookings,
    initialValues,
    selectedDate,
  });
  for (let bookings of existingBookings) {
    if (initialValues && bookings.key === initialValues.key) {
      continue;
    }

    if (bookings.meetingType === roomType && moment(bookings.meetingDate).format("YYYY-MM-DD") === selectedDate) {
      const existingStart = moment(bookings.meetingStartTime);
      const existingEnd = moment(bookings.meetingEndTime);

      if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
        return true;
      }
    }
  }
  return false;
}
const BookingFormModal = ({ visible, onCancel, onSubmit, initialValues, existingBookings = [] }) => {
  const [form] = Form.useForm();
  const [meetingOption, setMeetingOption] = useState([]);

  const loadOptions = () => {
    const storedData = localStorage.getItem("rooms");
    if (storedData) {
      setMeetingOption(JSON.parse(storedData));
    }
  }

  useEffect(() => {
    loadOptions();

    window.addEventListener("localStorageUpdated", loadOptions);
    return () => {
      window.removeEventListener("localStorageUpdated", loadOptions);
    };
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        meetingType: initialValues.meetingType,
        meetingTitle: initialValues.meetingTitle,
        meetingDescription: initialValues.meetingDescription,
        meetingDate: initialValues.meetingDate ? moment(initialValues.meetingDate) : null,
        meetingStartTime: initialValues.meetingStartTime ? moment(initialValues.meetingStartTime, "HH:mm") : null,
        meetingEndTime: initialValues.meetingEndTime ? moment(initialValues.meetingEndTime, "HH:mm") : null
      });
    }
    else {
      form.resetFields();
    }
  }, [initialValues, form, visible]);

  const handleFinish = (values) => {
    const { meetingType, meetingDate, meetingStartTime, meetingEndTime } = values;

    // if (meetingStartTime.isSameOrAfter(meetingEndTime)) {
    //   message.error("Start time must be before end time!");
    //   return;
    // }

    const hasConflict = checkConflict(meetingType, meetingStartTime, meetingEndTime, meetingDate, existingBookings, initialValues);
    if (hasConflict) {
      message.error("Meeting time conflicts with existing bookings!");
      return;
    }
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
                <Option key={item.key} value={item.key}>{item.name}</Option>
              )
            })}
          </Select>
        </Form.Item>

        <Form.Item
          label="Meeting Title"
          name="meetingTitle"
        >
          <Input placeholder="Enter meeting title" />
        </Form.Item>

        <Form.Item
          label="Meeting Description"
          name="meetingDescription"
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
          label="Choose Start Time"
          name="meetingStartTime"
          rules={[{ required: true, message: 'Please select the meeting start time' }]}
        >
          <TimePicker
            showTime
            format="HH:mm"
            placeholder="Select start time (8:00 AM - 6:00 PM)"
            style={{ width: '100%' }}
            mode={'time'}
            disabledTime={() => ({
              disabledHours: () => {
                return [...Array(8).keys(), ...Array(6).keys().map(i => i + 18)];
              }
            })}
          />
        </Form.Item>

        <Form.Item
          label="Choose End Time"
          name="meetingEndTime"
          rules={[
            { required: true, message: 'Please select the meeting end time' },

          ]}
        >
          <TimePicker
            showTime
            format="HH:mm"
            placeholder="Select start time (8:00 AM - 6:00 PM)"
            style={{ width: '100%' }}
            mode={'time'}
            disabledTime={() => ({
              disabledHours: () => {
                return [...Array(8).keys(), ...Array(6).keys().map(i => i + 18)];
              }
            })}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            {initialValues ? 'Update Booking' : 'Add Booking'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookingFormModal;
