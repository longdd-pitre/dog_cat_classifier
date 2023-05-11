import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import {
  Button, TextField
} from "@mui/material";
import {  useRouter } from "next/router";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import React from "react";
const WelcomePage = () => {
  const [roomId, setRoomId] = React.useState(null);
  const [showJoinBtn, setShowJoinBtn] = React.useState(false);
  const router = useRouter();

  const handleJoinRoom = async () => {
    enqueueSnackbar({
      message: "Đang gia nhập phòng",
      anchorOrigin: {
        horizontal: "center",
        vertical: "top",
      },
      variant: "success",
      autoHideDuration: 3000,
      onClose : () => {
        router.push(`meet/${roomId}`)
      }
    });

  };

  const handleCreateRoom = () => {
    window.alert("Tạo room đi pạn");
  };

  const handleShowJoinBtn = (show) => {
    if (!roomId) {
      show = false;
    } else {
      show = true;
    }
    setShowJoinBtn(show);
  };

  return (
    <div>
      <SnackbarProvider />
      <div
        style={{ height: "100vh" }}
        className="row align-items-center justify-content-between"
      >
        <div className="col-5 mx-auto">
          <div className="row mb-3">
            <h2>Ứng dụng video conference sử dụng kết nối P2P</h2>
            <h6>Đừng ngần ngại. Điền mã phòng vào ô bên dưới. Nếu phòng chưa tồn tại, chúng tôi sẽ tạo ra cho bạn!</h6>
          </div>
          <div className="row">
            <div className="d-flex col-6">
              <TextField
                type='text'
                margin="none"
                onChange={($event) => setRoomId($event.target.value)}
                label="Mã phòng"
                onFocus={() => setShowJoinBtn(true)}
                onBlur={() => handleShowJoinBtn(false)}
                placeholder="Vui lòng nhập mã phòng"
              ></TextField>
              <Button
                sx={{ marginLeft: "16px" }}
                disabled={!roomId}
                startIcon={<VideoCallOutlinedIcon/>}
                onClick={() => handleJoinRoom()}
                hidden={!showJoinBtn}
              >
                Tham gia
              </Button>
            </div>
          </div>
        </div>
        <div
          className="col-6"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundImage: "url(img/4457.jpg)",
            backgroundSize: "contain",
            height: "100%",
          }}
        ></div>
      </div>
    </div>
  );
};

export default WelcomePage;
