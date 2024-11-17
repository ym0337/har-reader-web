import React, { useState } from "react";
import { Layout, Button, Table, message, Modal, Input, Form, Tag } from "antd";
import axiosInstance, { baseURL } from "../api/api.js";

const { Content } = Layout;

const ApiTable = ({ collapsed }) => {
  const [fileList, setFileList] = useState([]); // 保存文件列表
  const [open, setOpen] = useState(false);
  const [responseData, setResponseData] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [allTableData, setAllTableData] = useState([]);

  const [form] = Form.useForm();

  const handleFilter = (val = "") => {
    // console.log("Finish:", val);
    // console.log(allTableData,'allTableData')
    const filterData = allTableData.filter((item) => {
      return item.path.includes(val.trim());
    });
    setFileList(filterData);
  };

  // 获取文件列表
  const getFileList = async () => {
    try {
      // 替换为你的获取文件列表接口
      const response = await axiosInstance.get("/har/api/info");
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

  // 页面加载时获取文件列表
  React.useEffect(() => {
    getFileList();
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
      render: (text) => (
        <Tag color={text === "GET"? "volcano" : "green"}>{text}</Tag>
      ),
    },
    {
      title: "请求路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "历史路径",
      dataIndex: "fullpath",
      key: "fullpath",
      // align: "center",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "操作",
      key: "action",
      minWidth: 200,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <>
          <Button
            style={{ marginRight: "10px" }}
            color="primary"
            variant="outlined"
            onClick={() => handleDetail(record)}
          >
            查看返回值
          </Button>
        </>
      ),
    },
  ];
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
          <Form.Item name="path" onChange={(e) => handleFilter(e.target.value)}>
            <Input
              style={{ width: "400px" }}
              placeholder="请求路径"
              allowClear
              onClear={() => handleFilter()}
            />
          </Form.Item>
          {/* <Form.Item shouldUpdate>
            {() => (
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            )}
          </Form.Item> */}
        </Form>
        <Table
          tableLayout="auto"
          dataSource={fileList}
          columns={columns}
          scroll={{ x: "max-content" }}
        />
        <Modal
          title={modalTitle}
          centered
          open={open}
          onCancel={() => setOpen(false)}
          width={1000}
          maskClosable={false}
          footer={[
            <Button key="ok" onClick={() => setOpen(false)}>关闭</Button>,
          ]}
        >
          <pre
            style={{
              backgroundColor: "#f9f9f9",
              padding: "10px",
              borderRadius: "5px",
              overflow: "auto",
              maxHeight: "80vh",
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
