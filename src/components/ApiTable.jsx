import React, { useState } from "react";
import {
  Layout,
  Button,
  Table,
  message,
  Modal,
  Input,
  Form,
  Tag,
  Select,
} from "antd";
import axiosInstance, { baseURL } from "../api/api.js";

const { Content } = Layout;

const ApiTable = ({ collapsed }) => {
  const [fileList, setFileList] = useState([]); // 保存文件列表
  const [open, setOpen] = useState(false);
  const [responseData, setResponseData] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [allTableData, setAllTableData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [form] = Form.useForm();

  const onFormChange = () => {
    const { method = "", path = "" } = form.getFieldsValue(["method", "path"]);
    const methodVal = method.trim();
    const pathVal = path.trim();
    let filterData = [];
    if (methodVal && pathVal) {
      filterData = allTableData.filter((item) => {
        return item.method === methodVal && item.path.includes(pathVal);
      });
    } else if (methodVal && !pathVal) {
      filterData = allTableData.filter((item) => {
        return item.method === methodVal;
      });
    } else if (!methodVal && pathVal) {
      filterData = allTableData.filter((item) => {
        return item.path.includes(pathVal);
      });
    } else {
      filterData = allTableData;
    }
    setFileList(filterData);
  };

  // 获取文件列表
  const getFileList = async (type = 0) => {
    try {
      // 替换为你的获取文件列表接口
      const response = await axiosInstance.get("/har/api/info");
      if (type === 1) {
        setSelectedRowKeys(response.data.methodOptions || []);
      }
      const data = response.data.data.map((item) => ({
        ...item,
        key: item.apiName,
        // method: item.method,
        // apiName: item.apiName,
        // path: item.path,
        // fullpath: item.fullpath,
      }));
      setAllTableData(data);
      setFileList(data);
    } catch (error) {
      message.error("获取文件列表失败！");
    }
  };

  // 执行文件脚本
  const handleDetail = async ({ method, path, apiName }) => {
    try {
      const response = await axiosInstance.get(`/har/api/detail/${apiName}`);
      setResponseData(JSON.stringify(response.data, null, 2));
      setModalTitle(`【${method}】${baseURL}${path}`);
      setOpen(true);
    } catch (error) {
      message.error(`文件 "${apiName}" 执行失败！`);
    }
  };

  const textColor = (text = "") => {
    let color = "magenta";
    switch (text.toUpperCase()) {
      case "GET":
        color = "cyan";
        break;
      case "POST":
        color = "green";
        break;
      case "PUT":
        color = "purple";
        break;
      case "DELETE":
        color = "red";
        break;
      case "PATCH":
        color = "orange";
        break;
      case "OPTIONS":
        color = "gray";
        break;
      default:
        color = "magenta";
        break;
    }
    return color;
  };

  const isValidJson = (data) => {
    if (typeof data !== "string") {
      return false; // 只有字符串类型的数据才能被解析为 JSON
    }
    if (!data.includes("{") || !data.includes("}") || !data.includes(":")) {
      return false; // 字符串中不包含 { 则不能被解析为 JSON
    }else {
      try {
        JSON.parse(data);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  // 页面加载时获取文件列表
  React.useEffect(() => {
    getFileList(1);
  }, []);

  // 列表表头配置
  const columns = [
    {
      title: "序号",
      dataIndex: "id",
      key: "id",
      minWidth: 100,
      align: "center",
    },
    {
      title: "method",
      dataIndex: "method",
      key: "method",
      minWidth: 100,
      align: "center",
      render: (text) => <Tag color={textColor(text)}>{text}</Tag>,
    },
    {
      title: "/response/*.json",
      dataIndex: "apiName",
      key: "apiName",
      minWidth: 140,
      align: "center",
    },
    {
      title: "请求路径（双击复制）",
      dataIndex: "path",
      key: "path",
      render: (text) => (
        <a
          style={{ color: "brown" }}
          href="#"
          target="_blank"
          onClick={(event) => event.preventDefault()}
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
    },
    {
      title: "历史路径",
      dataIndex: "fullpath",
      key: "fullpath",
      // align: "center",
      render: (text) => <span style={{ color: "gray" }}>{text}</span>,
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => handleDetail(record)}
          >
            响应数据
          </Button>
        </>
      ),
    },
  ];

  const handleDoubleClick = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("复制成功！");
      })
      .catch(() => {
        message.error("复制失败！");
      });
  };

  const customColumns = columns.map((col) => ({
    ...col,
    onCell: (record) => ({
      onDoubleClick: () => handleDoubleClick(record[col.dataIndex]),
    }),
  }));

  return (
    <>
      <Content
        style={{
          padding: "20px",
          width: collapsed ? "calc(100vw - 98px)" : "calc(100vw - 218px)",
        }}
      >
        <Form
          style={{ marginBottom: "20px" }}
          form={form}
          name="horizontal_login"
          layout="inline"
        >
          <Form.Item name="method">
            <Select
              style={{ width: "110px" }}
              showSearch
              placeholder="method"
              onChange={onFormChange}
              allowClear
              options={selectedRowKeys.map((m) => {
                return { value: m, label: m };
              })}
            />
          </Form.Item>
          <Form.Item name="path" onChange={() => onFormChange()}>
            <Input
              style={{ width: "400px" }}
              placeholder="请求路径"
              allowClear
              onClear={() => onFormChange()}
            />
          </Form.Item>
        </Form>
        <div>
          <Table
            tableLayout="auto"
            dataSource={fileList}
            columns={customColumns}
            scroll={{ x: "max-content", y: "calc(100vh - 350px)" }}
            pagination={false}
          />
        </div>
        <Modal
          title={modalTitle}
          centered
          open={open}
          onCancel={() => setOpen(false)}
          width={"80%"}
          maskClosable={false}
          footer={[
            <Button
              key="ok"
              type="primary"
              onClick={() => handleDoubleClick(responseData)}
            >
              复制
            </Button>,
            <Button key="cancel" onClick={() => setOpen(false)}>
              关闭
            </Button>,
          ]}
        >
          <pre
            style={{
              backgroundColor: "#f9f9f9",
              padding: "10px",
              borderRadius: "5px",
              overflow: "auto",
              maxHeight: "80vh",
              whiteSpace: isValidJson(responseData) ? "pre" : "normal",
            }}
          >
            {responseData}
          </pre>
        </Modal>
      </Content>
    </>
  );
};

export default ApiTable;
