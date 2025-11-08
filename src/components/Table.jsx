import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Popconfirm,
  Table,
  Typography,
  InputNumber,
  Space,
} from "antd";
import RoomModal from "./BookModal";
import BookModal from "./RoomModal";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function RoomTable() {
  const [form] = Form.useForm();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("room");
      return storedData ? JSON.parse(storedData) : [];
    }
    return [];
  });

  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ name: "", capacity: "", ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const deleteRecord = (record) => {
    const updatedData = dataSource.filter((ele) => ele.key !== record.key);
    localStorage.setItem("room", JSON.stringify(updatedData));
    setDataSource(updatedData);
  };

  const handleSave = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setDataSource(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setDataSource(newData);
        setEditingKey("");
      }
      localStorage.setItem("room", JSON.stringify(newData));
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "25%",
      editable: true,
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      width: "15%",
      editable: true,
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => handleSave(record.key)}
              style={{ marginInlineEnd: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Space>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              Edit
            </Typography.Link>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => deleteRecord(record)}
            >
              Delete
            </Typography.Link>
          </Space>
        );
      },
    },
  ];

  const handleRoomAdd = () => {
    setIsRoomModalOpen(true);
  };

    const handleBookAdd = () => {
      setIsBookModalOpen(true)
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "capacity" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div style={{ margin: "10px" }}>
      <Space
        align="center"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={handleRoomAdd}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Add Room
        </Button>
        <Button
          onClick={handleBookAdd}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Add Book
        </Button>
      </Space>
      <Form form={form} component={false}>
        <Table
          components={{
            body: { cell: EditableCell },
          }}
          bordered
          dataSource={dataSource}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{ onChange: cancel }}
        />
      </Form>
      <RoomModal
        setIsModalOpen={setIsRoomModalOpen}
        isModalOpen={isRoomModalOpen}
        setDataSource={setDataSource}
      />
      <BookModal
        setIsModalOpen={setIsBookModalOpen}
        isModalOpen={isBookModalOpen}
        setDataSource={setDataSource}
      />
    </div>
  );
}
