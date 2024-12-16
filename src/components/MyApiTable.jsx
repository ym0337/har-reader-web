import { useState, useEffect, act } from "react";
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
  Switch,
  Popconfirm,
  DatePicker,
} from "antd";
import axiosInstance, { baseURL } from "../api/api.js";

const { TextArea } = Input;
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [methodStr, setMethodStr] = useState(false);

  const [form] = Form.useForm();

  // 获取文件列表
  const getFileList = async (type = 0) => {
    try {
      const {
        method = "",
        path = "",
      } = form.getFieldsValue(["method", "path"]);
      const response = await axiosInstance.get("/har/myApi/list", {
        params: {
          method: method.trim(),
          path: path.trim(),
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
      const response = await axiosInstance.get(`/har/myApi/detail/${id}`);
      setResponseData(JSON.stringify(response.data, null, 2));
      setModalTitle(`【${method}】${baseURL}${path}`);
      setOpen(true);
    } catch (error) {
      message.error(`请求失败:`, error);
    }
  };

  const handleDelete = async ({ id }) => {
    try {
      const response = await axiosInstance.delete(`/har/myApi/delete/${id}`);
      message.success(response.data.message);
      getFileList();
    } catch (error) {
      message.error(`请求失败:`, error);
    }
  };

  const handleUpdate = (row, type=1) => {
    let params = {}
    if(type == 1){
      params = {...row}
    }else if(type == 2){
      params = {
        ...row,
        active: row.active === "激活" ? false : true,
      }
    }
    updateData(params);
  };

  const updateData = async (params) => {
    try {
      const response = await axiosInstance.put(`/har/myApi/update`, params);
      message.success(response.data.message);
      setAddModalOpen(false);
      getFileList();
    } catch (error) {
      message.error(`请求失败:`, error);
    }
  };

  const addData = async (params) => {
    try {
      const response = await axiosInstance.post(`/har/myApi/add`, params);
      // console.log("response", response);
      message.success(response.data.message);
      setAddModalOpen(false);
      getFileList();
    } catch (error) {
      message.error("新增失败！", error);
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

  const [basicForm] = Form.useForm();

  const showModal = (row = null) => {
    // console.log("showModal row", row);
    if (row) {
      setMethodStr(row.method || "GET");
      basicForm.setFieldsValue({
        ...row,
        active: row.active === "激活" ? true : false,
      });
    } else {
      setMethodStr("GET");
      basicForm.resetFields();
    }
    setAddModalOpen(true);
  };

  const handleOk = () => {
    // console.log("basicForm", basicForm.getFieldsValue());
    // 触发表单提交
    basicForm.submit(); // 调用表单的submit方法
  };

  const handleCancel = () => {
    setAddModalOpen(false);
  };

  const onFinish = async (values) => {
    // console.log("Success:", values);
    // editStatus
    const { method, path, postData, content, active, mark, id } = values;
    if (id) {
      updateData({
        method,
        path,
        postData,
        content,
        active,
        mark,
        id,
      });
    } else {
      addData({
        method,
        path,
        postData,
        content,
        active,
        mark,
      });
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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
      minWidth: 100,
      align: "center",
    },
    {
      title: "method",
      dataIndex: "method",
      minWidth: 100,
      align: "center",
      render: (text) => <Tag color={textColor(text)}>{text}</Tag>,
    },
    {
      title: "请求路径（单元格都可以双击复制）",
      dataIndex: "path",
      minWidth: 250,
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
      dataIndex: "active",
      width: 80,
      render: (text) => (
        <Tag color={text === "激活" ? "green" : "red"}>{text}</Tag>
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
      title: "备注",
      dataIndex: "mark",
      minWidth: 200
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <>
          <Button
            style={{ marginRight: "5px" }}
            color="primary"
            variant="outlined"
            onClick={() => handleDetail(record)}
          >
            响应数据
          </Button>
          <Button
            style={{ marginRight: "5px" }}
            color="primary"
            variant="solid"
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Button
            style={{
              marginRight: "5px",
              color: record.active === "激活" ? "red" : "green",
            }}
            color="primary"
            variant="outlined"
            onClick={() => handleUpdate(record,'2')}
          >
            {record.active === "激活" ? "禁用" : "激活"}
          </Button>
          <Popconfirm
            title="删除提示"
            description={`确认删除 "${record.path}" 吗？`}
            onConfirm={() => handleDelete(record)}
            onCancel={() => message.error("取消删除")}
            okText="是"
            cancelText="否"
          >
            <Button color="danger" variant="solid">
              删除
            </Button>
          </Popconfirm>
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
              onClick={() => showModal()}
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
          <Button type="primary" onClick={() => getFileList()}>
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

        <Modal
          title="自定义接口"
          centered
          open={addModalOpen}
          okText="保存"
          cancelText="取消"
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form
            name="basic"
            form={basicForm}
            labelCol={{
              span: 4,
            }}
            wrapperCol={{
              span: 20,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              method: "GET",
              path: "",
              active: true,
              content: "",
              postData: "",
              mark: "",
              id: ""
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item label="ID" name="id" style={{ display: "none" }}>
              {/* 如果你想隐藏 ID 输入框，可以设置为 display: 'none' */}
              <Input/>
            </Form.Item>
            <Form.Item
              label="请求类型"
              name="method"
              rules={[
                {
                  required: true,
                  message: "请求类型不能为空！",
                },
              ]}
            >
              <Select
                onChange={(val) => {
                  setMethodStr(val);
                }}
              >
                {["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"].map(
                  (m) => (
                    <Select.Option key={m} value={m}>
                      {" "}
                      {m}{" "}
                    </Select.Option>
                  )
                )}
              </Select>
            </Form.Item>

            <Form.Item
              label="请求路径"
              name="path"
              rules={[
                {
                  required: true,
                  message: "请求路径不能为空！",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="是否激活" name="active">
              <Switch />
            </Form.Item>

            <Form.Item label="post传参" name="postData">
              <TextArea
                rows={4}
                disabled={methodStr == "GET" || methodStr == "DELETE"}
              />
            </Form.Item>

            <Form.Item label="响应数据" name="content">
              <TextArea rows={8} />
            </Form.Item>

            <Form.Item label="备注" name="mark">
              <TextArea rows={2} />
            </Form.Item>

            {/* <Form.Item label="创建时间" name="createdate">
              <DatePicker />
            </Form.Item> */}

            {/* <Form.Item label={null}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item> */}
          </Form>
        </Modal>
      </Content>
    </>
  );
};

export default ApiTable;
