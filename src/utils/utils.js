import { message } from "antd";
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

export { handleDoubleClick };