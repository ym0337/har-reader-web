import {
  Button,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { handleDoubleClick } from '@/utils/utils.js'

const ModalTitle = ({title}) => {
  const handleCopy = (text) => {
    let str = text
    if(text.indexOf('【') > -1 && text.indexOf('】') > -1){
      str = text.split('】')[1]
    }
    return str;
  }
  return (
    <div style={{ display: 'flex'}}>
      <div style={{ fontSize:'18px'}}>{title}</div>
      <Button type="link" onClick={()=>handleDoubleClick(handleCopy(title))}>
        <CopyOutlined />
      </Button>
    </div>
  );
};

export default ModalTitle;