import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import VideoCall from "../components/VideoCall";
import { UserAuthStore } from "../store/userAuthStore";
import IncomingCallNotification from "../components/IncomingCallNotification";
import toast from "react-hot-toast";
const HomePage = () => {
  const {
    selectedUser,
  } = useChatStore();

  const { setisInVideoCall,isInVideoCall ,socket,isIncomingCall,setIsIncomingCall,setCallerInfo }= UserAuthStore();

  useEffect(() => {
    socket.on("incoming-call",(data) => {
      setIsIncomingCall(true);
      setCallerInfo(data.caller);
    })

    socket.on("call-rejected",(data) => {
      // console.log("Call rejected:",data);
      setIsIncomingCall(false);
      setisInVideoCall(false);
      setCallerInfo(null);
      toast.error(`Call rejected by ${data.from.fullName}`);
    })

    socket.on("call-accepted",(data) => {
      console.log(`Call accepted by ${data.from.fullName}`);
      toast.success(`Call accepted by ${data.from.fullName}`);
    })

    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-accepted");
    }
  },[socket])

  useEffect(() => {
    const savedVideoCallStatus = sessionStorage.getItem("videoCallStatus");
    if (savedVideoCallStatus === "true" && !isInVideoCall) {
      setisInVideoCall(true);
    }
  }, []);

  // Add effect to update sessionStorage when video call status changes
  useEffect(() => {
    sessionStorage.setItem("videoCallStatus", isInVideoCall);
  }, [isInVideoCall]);

  return (
    <div className="h-screen bg-base-200 relative">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
      {isInVideoCall && <VideoCall />}
      {isIncomingCall && <IncomingCallNotification />}
    </div>
  );
};

export default HomePage;
