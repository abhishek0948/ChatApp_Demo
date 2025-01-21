import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import VideoCall from "../components/VideoCall";

const HomePage = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isInVideoCall,
    setVideoCallStatus,
  } = useChatStore();

  useEffect(() => {
    const savedVideoCallStatus = sessionStorage.getItem("videoCallStatus");
    if (savedVideoCallStatus === "true" && !isInVideoCall) {
      setVideoCallStatus(true);
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
    </div>
  );
};

export default HomePage;
