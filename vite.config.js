import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// 获取脚本参数
const args = process.argv.slice(2); // 去掉前面的两个默认参数
const mode = args.find((arg) => arg.startsWith("--mode=")); // 查找自定义参数

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: mode === "--mode=web" ? "../har-reader-server/build_web" : "./dist", // 替换为你所需的输出目录
    emptyOutDir: true, // 强制清空输出目录,
  },
  server: {
    open: true, // 设置为 true，启动时自动打开浏览器
    // open: '/your-specific-page', // 启动时打开特定页面
    port: 5172, // 设置端口号
  },
});
