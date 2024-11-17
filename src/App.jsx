import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import Main from './pages/Main';
import ProtectedRoute from './components/ProtectedRoute';

// const router = createBrowserRouter([
//   // 你的路由配置
//   {
//     path: "/login",
//     element: <Login />, // 登录组件
//   },
//   {
//     path: "/main",
//     element: <Main />, // 主页面组件
//   },
// ], {
//   future: {
//     v7_startTransition: true,
//     v7_normalizeFormMethod: true,
//     v7_skipActionErrorRevalidation: true,
//   },
// });


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* 受保护的主页面 */}
        <Route path="/main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
        {/* 默认重定向到登录页 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
    // <RouterProvider router={router} />
  );
};

export default App;
