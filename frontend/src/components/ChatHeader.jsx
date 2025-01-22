import { Video, X } from "lucide-react";
import { UserAuthStore } from "../store/userAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallback } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { setIsCalling, setIsIncomingCall, setisInVideoCall,socket } = UserAuthStore();

  const { onlineUsers,authUser } = UserAuthStore();

  const callStarted = useCallback(() => {
    setIsCalling(true);
    setIsIncomingCall(false);
    setisInVideoCall(true);
    socket.emit("call-initiated",{to:selectedUser,from:authUser})
  },[selectedUser,authUser]) 

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="flex flex-row gap-6">
          <button className="hover:bg-base-300 p-2 rounded-full" onClick={callStarted}>
            <Video />
          </button>
          <button className="hover:bg-base-300 p-2 rounded-full" onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;