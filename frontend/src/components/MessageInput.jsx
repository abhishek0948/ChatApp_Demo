import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      toast.error("File is too large. Maximum size is 5 MB.");
      return;
    }
  
    const reader = new FileReader();

    reader.onerror = () => {
      toast.error("Failed to read file");
      reader.abort();
    };

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) return ;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview
      })

      setText("");
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
      console.log("Error in sending Message",error);
    }
    
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
        <div className="flex-1 flex gap-2">
        <input
          type="text"
          className="w-full input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
        <button
          type="button"
          className={`hidden sm:flex btn btn-circle ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>
        </div>

        <button
          type="submit"
          className={`btn btn-circle`}
          disabled={!text.trim() && !imagePreview}
          // onClick={}
        >
          <Send size={22} />
        </button>
      </form>
    </div>

    // <p>MessageINput</p>
  );
};

export default MessageInput;
