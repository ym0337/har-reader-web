import { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
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
  Tooltip,
  Pagination,
} from "antd";
import axiosInstance, { baseURL } from "../api/api.js";

const { Content } = Layout;

const ApiTable = ({ collapsed }) => {
  const [fileList, setFileList] = useState([]); // 保存文件列表
  const [open, setOpen] = useState(false);
  const [responseData, setResponseData] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [form] = Form.useForm();

  // 获取文件列表
  const getFileList = async (type = 0) => {
    try {
      const {
        method = "",
        path = "",
        originfile = "",
      } = form.getFieldsValue(["method", "path", "originfile"]);
      const response = await axiosInstance.get("/har/api/info", {
        params: {
          method: method.trim(),
          path: path.trim(),
          originfile: originfile.trim(),
          pageNo: pageNo,
          pageSize: pageSize,
        },
      });
      if (type === 1) {
        // 设置method选项
        setSelectedRowKeys(response.data.methodOptions || []);
      }
      const data = response.data.data.map((item) => ({
        ...item,
        key: item.id,
      }));
      // setAllTableData(data);
      setFileList(data);
      setTotal(response.data.total);
    } catch (error) {
      message.error(`获取文件列表失败: ${error}`);
    }
  };

  const handleDetail = async ({ id, method, path }) => {
    try {
      const response = await axiosInstance.get(`/har/api/detail/${id}`);
      setResponseData(JSON.stringify(response.data, null, 2));
      setModalTitle(`【${method}】${baseURL}${path}`);
      setOpen(true);
    } catch (error) {
      message.error(`文件执行失败:`, error);
    }
  };

  const onPageChange = (page) => {
    setPageNo(page);
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
    } else {
      try {
        JSON.parse(data);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  // 页面加载时获取文件列表
  useEffect(() => {
    getFileList(1);
  }, [pageNo]);

  // 列表表头配置
  const columns = [
    {
      title: "序号",
      dataIndex: "no",
      // key: "no",
      minWidth: 100,
      align: "center",
    },
    {
      title: "method",
      dataIndex: "method",
      // key: "method",
      minWidth: 100,
      align: "center",
      render: (text) => <Tag color={textColor(text)}>{text}</Tag>,
    },
    {
      title: "请求路径（单元格都可以双击复制）",
      dataIndex: "path",
      minWidth: 250,
      // key: "path",
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
      title: "状态",
      dataIndex: "originfile",
      minWidth: 200,
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 200, // 根据需要设置宽度
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "post传参",
      dataIndex: "postData",
      minWidth: 300,
      align: "center",
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: 300, // 根据需要设置宽度
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
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
          <Button
            color="primary"
            variant="outlined"
            onClick={() => handleDetail(record)}
          >
            编辑
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => handleDetail(record)}
          >
            禁用
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => handleDetail(record)}
          >
            删除
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
          <Form.Item>
            <Button
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
            ></Button>
          </Form.Item>
          <Form.Item name="method">
            <Select
              style={{ width: "110px" }}
              showSearch
              placeholder="请求类型"
              // onChange={onFormChange}
              allowClear
              options={selectedRowKeys.map((m) => {
                return { value: m, label: m };
              })}
            />
          </Form.Item>
          <Form.Item
            name="path"
            //  onChange={() => onFormChange()}
          >
            <Input
              style={{ width: "400px" }}
              placeholder="请求路径"
              allowClear
              // onClear={() => onFormChange()}
            />
          </Form.Item>
          <Form.Item name="originfile">
            <Input
              style={{ width: "200px" }}
              placeholder="所属文件"
              allowClear
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={() => getFileList()}
          >
            查询
          </Button>
        </Form>
        <div>
          <Table
            tableLayout="auto"
            dataSource={fileList}
            columns={customColumns}
            scroll={{ x: "max-content", y: "calc(100vh - 330px)" }}
            pagination={false}
          />
          <Pagination
            style={{ marginTop: "20px" }}
            align="end"
            total={total}
            showTotal={(total) => `共 ${total} 条`}
            pageSize={pageSize}
            showSizeChanger={false}
            current={pageNo}
            onChange={onPageChange}
            defaultCurrent={1}
            // onShowSizeChange={onShowSizeChange}
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
