import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { UserAuthStore } from '../store/userAuthStore';
import toast from 'react-hot-toast';

const IncomingCallNotification = () => {
    const { isIncomingCall, callerInfo, socket,setIsIncomingCall,authUser,setisInVideoCall,setSelectedUser } = UserAuthStore();

    if (!isIncomingCall || !callerInfo) return null;

    const handleAcceptCall = () => {
        if (!socket?.connected) {
            toast.error("Connection lost");
            return;
        }

        socket.emit("accept-call",{to:callerInfo ,from: authUser});
        setIsIncomingCall(false);
        setisInVideoCall(true);
        setSelectedUser(callerInfo);
    };

    const handleRejectCall = () => {
        if (!socket?.connected) return;
        socket.emit("reject-call",{to:callerInfo ,from: authUser});
        setIsIncomingCall(false);
    };

    console.log(callerInfo);

    return (
        <div className="fixed top-5 right-5 z-50 bg-base-100 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-4">
                <img 
                    src={callerInfo?.profilePic || "/avatar.png"} 
                    alt="caller" 
                    className="w-12 h-12 rounded-full"
                />
                <div>
                    <p className="font-medium">{callerInfo?.fullName}</p>
                    <p className="text-sm text-base-content/70">Incoming video call...</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        className="btn btn-circle btn-success"
                        onClick={handleAcceptCall}
                    >
                        <Phone />
                    </button>
                    <button 
                        className="btn btn-circle btn-error"
                        onClick={handleRejectCall}
                    >
                        <PhoneOff />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallNotification; 