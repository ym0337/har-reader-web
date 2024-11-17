import React, { useState } from "react";
import {
  Layout,
  Button,
  Upload,
  Table,
  message,
  Menu,
  theme,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import axiosInstance from "../api/api.js";

const { Header, Content, Footer, Sider } = Layout;

const Main = () => {
  const [fileList, setFileList] = useState([]); // 保存文件列表
  const [loading, setLoading] = useState(false); // 上传按钮状态
  const [collapsed, setCollapsed] = useState(false); // 侧边栏状态
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 上传文件
  const handleUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file); // 将文件附加到 FormData

    try {
      // 替换为你的上传接口
      const response = await axiosInstance.post(
        "http://localhost:3000/har/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      message.success(
        `文件 "${response.data.filename}" ${response.data.message}`
      );

      // 更新文件列表
      getFileList();
    } catch (error) {
      message.error(`文件 "${file.name}" 上传失败！`);
    } finally {
      setLoading(false);
    }
  };

  // 获取文件列表
  const getFileList = async () => {
    try {
      // 替换为你的获取文件列表接口
      const response = await axiosInstance.get(
        "http://localhost:3000/har/files"
      );
      setFileList(
        response.data.map((item) => ({
          key: item.key,
          filename: item.filename,
          path: item.path,
          createdAt: item.createdAt,
        }))
      );
    } catch (error) {
      message.error("获取文件列表失败！");
    }
  };

  // 删除文件
  const handleDelete = async (key) => {
    console.log(key);
    try {
      // 替换为你的删除文件接口
      await axiosInstance.delete(`http://localhost:3000/har/files/${key}`);
      getFileList();
      message.success(`文件 "${key}" 删除成功！`);
    } catch (error) {
      message.error(`文件 "${key}" 删除失败！`);
    }
  };

  // 执行文件脚本
  const handleActive = async (key) => {
    try {
      // 替换为你的执行文件接口
      await axiosInstance.post(`http://localhost:3000/har/run-script`);
      message.success(`文件 "${key}" 执行成功！`);
    } catch (error) {
      message.error(`文件 "${key}" 执行失败！`);
    }
  };

  // 页面加载时获取文件列表
  React.useEffect(() => {
    getFileList();
  }, []);

  // 上传组件的配置
  const uploadProps = {
    showUploadList: false, // 不展示默认的上传列表
    beforeUpload: (file) => {
      handleUpload(file); // 调用上传逻辑
      return false; // 阻止默认上传行为
    },
  };

  // 列表表头配置
  const columns = [
    {
      title: "文件名",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "上传时间",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "文件地址",
      dataIndex: "path",
      key: "path",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            style={{ marginRight: "10px" }}
            color="primary"
            variant="outlined"
            onClick={() => handleActive(record.key)}
          >
            执行
          </Button>

          <Popconfirm
            title="删除提示"
            description={`确认删除 "${record.filename}" 吗？`}
            onConfirm={() => handleDelete(record.key)}
            onCancel={() => message.error("取消删除")}
            okText="是"
            cancelText="否"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <Layout>
        <Header
          style={{
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>工作台</div>
          <Button
            type="primary"
            onClick={() => {
              localStorage.removeItem("isAuthenticated");
              message.info("已退出登录");
              window.location.href = "/login";
            }}
          >
            退出登录
          </Button>
        </Header>
      </Layout>
      <Layout>
        <Sider
          style={{ width: 200 }}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={[
              {
                key: "1",
                icon: <UserOutlined />,
                label: "文件库",
              },
              {
                key: "2",
                icon: <VideoCameraOutlined />,
                label: "接口列表",
              },
            ]}
          />
        </Sider>
        <Row>
          <Col span={24}>
            <Header
              style={{
                background: colorBgContainer,
                paddingLeft: "2px",
                width: collapsed ? "calc(100vw - 98px)" : "calc(100vw - 218px)",
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  width: 64,
                  height: 64,
                }}
              />
            </Header>
          </Col>
          <Col span={24}>
            <Content
              style={{
                padding: "20px",
                width: collapsed ? "calc(100vw - 98px)" : "calc(100vw - 218px)",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <Upload {...uploadProps}>
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={loading}
                  >
                    上传文件
                  </Button>
                </Upload>
              </div>
              <Table dataSource={fileList} columns={columns} />
              <Footer style={{ textAlign: "center" }}>
                Ant Design ©2024 Created by You
              </Footer>
            </Content>
          </Col>
        </Row>
      </Layout>
    </>
  );
};


export default Main;
