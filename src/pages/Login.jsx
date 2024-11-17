import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/api.js';
const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    // 模拟登录逻辑
    if (values.username === 'admin' && values.password === '123456') {
      const res = await axiosInstance.post('/har/login',{
        username: values.username,
        password: values.password,
      });
      if(res.data.code === 200){
        localStorage.setItem('isAuthenticated', 'true');
        message.success('登录成功！');
        navigate('/main');
      }else{
        message.error('登录失败！');
      }
    } else {
      message.error('用户名或密码错误！');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Form
        name="login"
        onFinish={onFinish}
        style={{ maxWidth: 300, width: '100%' }}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{
          username: 'admin', // 设置默认用户名
          password: '123456', // 设置默认密码
        }}
      >
        <h2 style={{ textAlign: 'center' }}>登录</h2>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: '请输入密码！' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
