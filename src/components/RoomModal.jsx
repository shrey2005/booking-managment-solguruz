import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

const RoomFormModal = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={initialValues ? "Edit Room" : "Add Room"}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <Form.Item
          label="Room Name"
          name="name"
          rules={[{ required: true, message: "Please input the room name!" }]}
        >
          <Input placeholder="Room Name" />
        </Form.Item>
        <Form.Item
          label="Capacity"
          name="capacity"
          rules={[{ required: true, message: "Please input the capacity!" }]}
        >
          <Input placeholder="Capacity" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoomFormModal;
