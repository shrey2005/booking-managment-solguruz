import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Button, Select, TimePicker } from "antd";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Option } = Select;

const toDayjs = (value, format = 'HH:mm') => {
  if (!value) return null;

  if (dayjs?.isDayjs(value)) {
    return value;
  }

  if (value && typeof value === 'object' && value.hour === 'function' && value.minute === 'function') {
    return dayjs().hour(value.hour()).minute(value.minute()).second(0).millisecond(0);
  }

  const parsed = dayjs(value, format, true);
  if (!parsed.isValid()) {
    return parsed;
  }

  const fallback = dayjs(value);
  return fallback.isValid() ? fallback : null;
}

const combineDateAndTime = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;

  let date = dayjs(dateValue, 'YYYY-MM-DD', true);
  if (dayjs?.isDayjs(dateValue)) {
    date = dateValue;
  }
  else if (dateValue && typeof dateValue === 'object' && dateValue.year === 'function') {
    date = dayjs().year(dateValue.year()).month(dateValue.month()).date(dateValue.date());
  }
  else if (!date.isValid()) {
    date = dayjs(dateValue);
  }

  if (!date?.isValid()) return null;

  const time = toDayjs(timeValue, 'HH:mm');
  if (!time) return null;

  return date.hour(time.hour()).minute(time.minute()).second(0).millisecond(0);
}

const checkConflict = (roomType, date, existingBookings, initialValues) => {
  console.log({ roomType, date, existingBookings, initialValues });
  if (!roomType || !date) return false;

  const selectedDate = dayjs(date, 'YYYY-MM-DD', true);

  for (let booking of existingBookings) {
    if (initialValues && booking.key === initialValues.key) {
      continue;
    }

    if (booking.meetingType !== roomType) {
      continue;
    }

    const bookingDate = dayjs(booking.meetingDate).format('YYYY-MM-DD');
    if (selectedDate.format('YYYY-MM-DD') === bookingDate) {
      return true;
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
        meetingDate: initialValues.meetingDate ? dayjs(initialValues.meetingDate, "YYYY-MM-DD") : null,
        meetingStartTime: initialValues.meetingStartTime ? dayjs(initialValues.meetingStartTime, "HH:mm") : null,
        meetingEndTime: initialValues.meetingEndTime ? dayjs(initialValues.meetingEndTime, "HH:mm") : null
      });
    }
    else {
      form.resetFields();
    }
  }, [initialValues, form, visible]);

  const handleFinish = (values) => {
    const { meetingType, meetingDate, meetingStartTime, meetingEndTime } = values;

    const start = combineDateAndTime(meetingDate, meetingStartTime)
    const end = combineDateAndTime(meetingDate, meetingEndTime)

    if (!start || !end) {
      toast.error("Please select valid date and time")
      return
    }

    if (!start.isBefore(end)) {
      toast.error("Start time must be before end time!");
      return;
    }

    const durationMinutes = end.diff(start, 'minutes')

    if (durationMinutes < 30) {
      toast.error("Meeting duration must be at least 30 minutes!");
      return;
    }

    if (durationMinutes > 4 * 60) {
      toast.error("Meeting duration cannot exceed 4 hours!");
      return;
    }

    const hasConflict = checkConflict(meetingType, meetingDate, existingBookings, initialValues);
    console.log({ hasConflict });
    if (hasConflict) {
      toast.error("Meeting time conflicts with existing bookings!");
      return;
    }

    const payload = {
      ...values,
      meetingDate: start.format('YYYY-MM-DD'),
      meetingStartTime: start.format('HH:mm'),
      meetingEndTime: end.format('HH:mm'),
    }
    onSubmit(payload);
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
        <Toaster />
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
            placeholder="Select end time (8:00 AM - 6:00 PM)"
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
