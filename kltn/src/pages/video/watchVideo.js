import { Grid } from "@mui/material";
import React from "react";
import videojs from "video.js";
import VideoPlayer from "../videoPlayer";

const WatchVideo = () => {
  const playerRef = React.useRef(null);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "//vjs.zencdn.net/v/oceans.mp4",
        type: "video/mp4",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={9}>
        <VideoPlayer
          options={videoJsOptions}
          onReady={handlePlayerReady}
        ></VideoPlayer>
      </Grid>
      <Grid item xs={3}>
        Chat Area
      </Grid>
    </Grid>
  );
};

export default WatchVideo;
