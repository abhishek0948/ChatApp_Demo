import { CameraOff, MicOffIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { UserAuthStore } from '../store/userAuthStore';
import peer from '../service/peer';

const VideoCall = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    
    const { socket } = UserAuthStore();

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    startMedia();
    // Cleanup function to stop all tracks when component unmounts
    // return () => {
    //   if (localStream) {
    //     localStream.getTracks().forEach(track => track.stop());
    //   }
    // };
  }, []);

  const handlePeerConnectionInitiated = useCallback(async (data) => {
    const offer = await peer.getOffer();
    socket.emit("send-offer",{to:data.to,from:data.from,offer});
  },[socket]);

  const handleReceiveOffer = useCallback(async(data) => {
    const ans = await peer.getAnswer(data.offer);
    socket.emit("send-answer",{to:data.to,from:data.from,answer:ans});
  },[socket]);

  const handleReceiveAnswer = useCallback(async(data) => {
    await peer.setLocalDescription(data.answer);
    for(const track of localStream?.getTracks()) {
      peer.peer.addTrack(track,localStream);
    }
  },[socket,localStream]);

  useEffect(() => {
    peer.peer.addEventListener("track",async ev => {
      const remoteStream = ev.streams;
      try {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      } catch (err) {
        console.error("Error adding track:",err);
      }
    });

    // return () => {
    //   if (remoteStream) {
    //     remoteStream.getTracks().forEach(track => track.stop());
    //   }
    // };
  })
  useEffect(() => {
    socket.on("peer-connection-initiated",handlePeerConnectionInitiated);
    socket.on("receive-offer",handleReceiveOffer);
    socket.on("receive-answer",handleReceiveAnswer);

    return () => {
      socket.off("peer-connection-initiated",handlePeerConnectionInitiated);
      socket.off("receive-offer",handleReceiveOffer);
      socket.off("receive-answer",handleReceiveAnswer);
    }
  },[socket])

  console.log("Printing Local Stream",localStream);
  return (
    <Draggable handle=".drag-handle">
      <div className='drag-handle top-10 left-20 fixed z-50 w-full max-w-6xl'>
        <div className='bg-base-100 rounded-lg shadow-xl p-4 relative'>
          {/* Drag handle */}
          <div className="drag-handle absolute top-0 left-0 w-full h-12 bg-base-200 rounded-t-lg cursor-move flex items-center justify-center">
            <div className="w-20 h-1.5 bg-base-300 rounded-full"></div>
          </div>

          <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Local video */}
            <div className='relative bg-gray-800 rounded-lg overflow-hidden aspect-video'>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className='w-full h-full object-cover'
              />
              <div className='absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded'>
                You
              </div>
            </div>

            {/* Remote video */}
            <div className='relative bg-gray-800 rounded-lg overflow-hidden aspect-video'>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className='w-full h-full object-cover'
              />
              <div className='absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded'>
                Remote User
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className='mt-4 flex justify-center gap-4'>
            <button className='btn btn-circle '>
               <MicOffIcon />
            </button>
            <button className='btn btn-circle btn-error'>
                {/* <Ca */}
            </button>
            <button className='btn btn-circle'>
              <CameraOff />
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default VideoCall;