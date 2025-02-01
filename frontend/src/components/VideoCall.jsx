import { CameraOff, MicOffIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { UserAuthStore } from "../store/userAuthStore";
import peer from "../service/peer";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const { socket } = UserAuthStore();
  const { setisInVideoCall,authUser,callerInfo,setCallerInfo }= UserAuthStore();
  const {selectedUser} = useChatStore();

  useEffect(() => {
    if (localStream) {
      // If localStream is ready, add tracks to the peer
      console.log("localStream is ready, adding tracks to peer connection");
      for (const track of localStream.getTracks()) {
        peer.peer.addTrack(track, localStream);
      }
    }
  }, [localStream]);

  useEffect(() => {
    const handleTrack = async (ev) => {
      const remotestream = ev.streams[0];
      setRemoteStream(remotestream);
      
      // Update this to use remotestream instead of remoteStream
      if (document.getElementById("remote-video")) {
        document.getElementById("remote-video").srcObject = remotestream;
      }
    };
  
    peer.peer.ontrack = handleTrack;
    
    return () => {
      peer.peer.ontrack = null;
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [remoteStream]);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    startMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleEndCall = useCallback(
    async () => {
      // Stop all local tracks
      if (localStream) {
        await localStream.getTracks().forEach((track) => track.stop());
      }

      // Stop all remote tracks
      if (remoteStream) {
         await remoteStream.getTracks().forEach((track) => track.stop());
      }

      // Close and cleanup the peer connection
      if (peer.peer) {
        peer.peer.close();
      }

      // Reset states
      setLocalStream(null);
      setRemoteStream(null);
      setisInVideoCall(false);
      // Notify other user that call has ended
      socket.emit("end-call", { to: callerInfo, from: authUser });
      setCallerInfo(null);
      toast.success("Call Ended");
    },
    [localStream, remoteStream, socket, callerInfo, authUser]
  );

  const handleCloseConnection = useCallback(
    async () => {
      if (localStream) {
        await localStream.getTracks().forEach((track) => track.stop());
      }

      // Stop all remote tracks
      if (remoteStream) {
        await remoteStream.getTracks().forEach((track) => track.stop());
      }

      // Close and cleanup the peer connection
      if (peer.peer) {
        peer.peer.close();
      }

      // Reset states
      setLocalStream(null);
      setRemoteStream(null);
      setisInVideoCall(false);
      setCallerInfo(null);
      toast.success("Call Ended");
    }
  ,[localStream,remoteStream,socket,selectedUser]);

  const handlePeerConnectionInitiated = useCallback(
    async (data) => {
      const offer = await peer.getOffer();
      socket.emit("send-offer", { to: data.to, from: data.from, offer });
    },
    [socket]
  );

  const handleReceiveOffer = useCallback(
    async (data) => {
      const ans = await peer.getAnswer(data.offer);
      socket.emit("send-answer", { to: data.to, from: data.from, answer: ans });
    },
    [socket]
  );

  const handleReceiveAnswer = useCallback(
    async (data) => {
      await peer.setLocalDescription(data.answer);

      console.log("local stream in answer", localStream);
      // try {
      //   const stream = await navigator.mediaDevices.getUserMedia({
      //     video: true,
      //     audio: true,
      //   });

      //   setLocalStream(stream);
      //   if (localVideoRef.current) {
      //     localVideoRef.current.srcObject = stream;
      //   }
      //   for (const track of stream.getTracks()) {
      //     console.log("ading track", track);
      //     peer.peer.addTrack(track, stream);
      //   }
      // } catch (error) {
      //   console.error("Error accessing media devices:", error);
      // }
      console.log("answer", data.answer);
    },
    [localStream]
  );

  useEffect(() => {
    const handleTrack = async (ev) => {
      const remotestream = ev.streams[0];
      console.log("In event", remotestream);
      setRemoteStream(remotestream);
      // if (remoteVideoRef.current) {
      //   remoteVideoRef.current.srcObject = remotestream;
      // }
      console.log("remoteStream", remoteStream);
      document.getElementById("remote-video").srcObject = remoteStream;
    };

    peer.peer.ontrack = handleTrack;
    peer.peer.addEventListener("track", handleTrack);

    return () => {
      peer.peer.removeEventListener("track", handleTrack);
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [remoteStream]);

  useEffect(() => {
    socket.on("peer-connection-initiated", handlePeerConnectionInitiated);
    socket.on("receive-offer", handleReceiveOffer);
    socket.on("receive-answer", handleReceiveAnswer);
    socket.on("call-ended",handleCloseConnection);

    return () => {
      socket.off("peer-connection-initiated", handlePeerConnectionInitiated);
      socket.off("receive-offer", handleReceiveOffer);
      socket.off("receive-answer", handleReceiveAnswer);
      socket.off("call-ended",handleCloseConnection);
    };
  }, [socket]);

  return (
    <Draggable handle=".drag-handle">
      <div className="drag-handle top-10 left-20 fixed z-50 w-full max-w-6xl">
        <div className="bg-base-100 rounded-lg shadow-xl p-4 relative">
          {/* Drag handle */}
          <div className="drag-handle absolute top-0 left-0 w-full h-12 bg-base-200 rounded-t-lg cursor-move flex items-center justify-center">
            <div className="w-20 h-1.5 bg-base-300 rounded-full"></div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                You
              </div>
            </div>

            {/* Remote video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                id="remote-video"
              />
              <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                Remote User
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-center gap-4">
            <button className="btn btn-circle ">
              <MicOffIcon />
            </button>
            <button onClick={handleEndCall} className="btn btn-circle btn-error">{/* <Ca */}</button>
            <button className="btn btn-circle">
              <CameraOff />
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default VideoCall;
