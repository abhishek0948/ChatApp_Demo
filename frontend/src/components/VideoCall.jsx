import { CameraOff, MicOff, MicOffIcon, Speaker, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { UserAuthStore } from '../store/userAuthStore';

const VideoCall = () => {
    
    const [localStream, setLocalStream] = useState(null);
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
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    startMedia();
    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    socket.on("peer-connection-initiated",(data) => {
      console.log("Peer connection initiated:",data);
    })

    return () => {
      socket.off("peer-connection-initiated");
    }
  },[socket])
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