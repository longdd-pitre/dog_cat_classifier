import ChatIcon from "@mui/icons-material/Chat";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

// style
import { uuidv4 } from "@firebase/util";
import styles from "./room.module.css";
import { Button } from "@mui/material";

let wsUri = "ws://222.252.14.117:8081/chat/{0}?token={1}";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};




const MeetRoom = () => {
  // Variable
  const ws = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const router = useRouter();
  const { meetId } = router.query;

  // States
  const [currentId, setCurrentId] = useState(uuidv4());
  const [wsMessage,setWsMessage] = useState(null);
  const [localStream, setLocalStream] = useState();
  const [peers, setPeers] = useState({});
  const [participants, setParticipants] = useState([]);
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio:true,video:true }).then( stream => {
        localVideoRef.current.srcObject = stream; 
        setLocalStream(stream)
      }, error => console.warn(error.message)
    );
    remoteVideoRef.current.srcObject = new MediaStream()
  },[])

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    wsUri = wsUri.replace('{0}',meetId).replace('{1}',currentId);
    const socket = new WebSocket(wsUri);
    socket.onmessage =  async (messageEvent) => {
      setWsMessage(messageEvent.data);
    };

    socket.onopen = (ev) => {
      socket.send(JSON.stringify({
        type: "startCall",
        fromId: currentId,
      }));
    }
    ws.current = socket;
    return () =>  socket.close();
  }, [router.isReady]);

  useEffect(() => {
     handleMessage()
  },[wsMessage])

  const handleMessage = async () => {
    try {
      const messageData = JSON.parse(wsMessage);
      if (messageData && messageData.type) {
        if (messageData.type === 'startCall' && messageData.fromId !== currentId){
           handleNewUserJoin(messageData.fromId);
        }
        
        else if (messageData.toId === currentId) {
          switch (messageData.type) {
            case "message":
              //! Thêm chức năng handle message
              break;
            case "offer":
               await handleOfferToYou(
                messageData.description,
                messageData.fromId
              );
              break;
            case "answer":
                await handleAnswerToYou(
                messageData.description,
                messageData.fromId
              );
              break;
            case 'new-ice-candidate':
              await handleNewIceCandidate(messageData.description,messageData.fromId);
              break;
            case "hangUp":
              break;
          }
        } else return;
      }
    } catch (ex) {
      console.log(wsMessage);
    }
  }
 
  const handleNewUserJoin = async (newJoinId) => {
    const peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners(peerConnection)
    peerConnection.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];  
    };
    if (localStream){
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track,localStream);
      })
    }
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const message = generateMeetMessage("new-ice-candidate",newJoinId, event.candidate )
        if (ws && ws.current){
          ws.current.send(message);
        }
      }
    }
    const sessionDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(sessionDescription);
    const message = generateMeetMessage("offer", newJoinId, sessionDescription);
    if (ws && ws.current){
      ws.current.send(message);
    }
    setPeers( peers => ({...peers,[newJoinId]:peerConnection}))
  };

  const handleOfferToYou = async (sessionDescription, fromId) => {
    if (fromId in peers) {
      return;
    } else {
      const peerConnection = new RTCPeerConnection(configuration);
      registerPeerConnectionListeners(peerConnection)
      if (localStream){
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track,localStream);
        })
      }
      peerConnection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0]; 
      };
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const message = generateMeetMessage("new-ice-candidate",fromId, event.candidate )
          if (ws && ws.current){
            ws.current.send(message);
          }
        }
      }
      peerConnection
        .setRemoteDescription(new RTCSessionDescription(sessionDescription))
        .then(async () => {
          const description = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(description);
          const message = generateMeetMessage("answer",fromId, description );
          setPeers( peers => ({...peers,[fromId]:peerConnection}))
          if (ws && ws.current) {
            ws.current.send(message);
          }
        });
    }
  };

  const handleAnswerToYou = async (sessionDescription, fromId) => {
    console.log('new Answer',fromId,peers);
    if (fromId in peers) {
      const pc = peers[fromId];
      await pc.setRemoteDescription(new RTCSessionDescription(sessionDescription));
      setPeers(peers => ({ ...peers, [fromId]: pc }));
      console.log('Peer connected');
    }
  };

  const handleNewIceCandidate =  async (iceCandidate,fromId) => {
    const candidate = new RTCIceCandidate(iceCandidate)
    try{
      if (fromId in peers){
        await peers[fromId].addIceCandidate(candidate);
      }
    }
    catch(err){
      console.error(err)
    }
  }

  const generateMeetMessage = (type, sendToId, sessionDescription) => {
    const obj = {
      type: type,
      fromId: currentId,
      toId: sendToId,
      description: sessionDescription,
    };
    return JSON.stringify(obj);
  };


  function registerPeerConnectionListeners(peerConnection) {
    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
          `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });
  
    peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });
  
    peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });
  
    peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
          `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
  
  }

  const toggleMedia = () => {
    navigator.getUserMedia({ audio: true, video: true }, stream => setLocalStream(stream) , error => console.warn(error.message));
  }

  return (
    <div className="bg-dark" style={{ height: "100vh" }}>
      <div className="text-white">Room id :{meetId}</div>
      <div className="participant-videos text-white">
        {Object.keys(peers)?.length > 0 && Object.keys(peers).map((key) => (
          <div>
            <span key={key}>Participant {key}</span>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <div className="col-3">Phần share xủng gì đó</div>
        <div className="col-6 d-flex justify-content-center">
          <div className="row bg-white">
            <video ref={localVideoRef} muted autoPlay playsInline></video>
            <video  ref={remoteVideoRef}  autoPlay playsInline></video>
          </div>
          <div className="row">
            <Button onClick={() => toggleMedia()} variant='contained' color='primary'>Hello</Button>            
          </div>
        </div>
        <div className="col-3">
          <ChatIcon fontSize="large" sx={{ cursor: "pointer" }}></ChatIcon>
        </div>
      </div>
    </div>
  );
};

export default MeetRoom;

/**
 * Keys of Obj to push to WebSocket
 * name:userName
 * Id: userId
 * avatar: url of user avatar. Can be null
 * Peer Infomation
 *
 * TODO:
 * Cần duy trì state lưu list người tham gia. userId => connections[userId] = new PeerConnection
 *
 */
