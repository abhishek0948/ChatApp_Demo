import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { UserAuthStore } from '../store/userAuthStore';
import toast from 'react-hot-toast';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const location = useLocation();

  const { email, fullName, profilePic } = location.state;

  const { connectSocket} = UserAuthStore();
  const setAuthUser = UserAuthStore((state) => state.setAuthUser);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/auth/set-password', {
        email,
        password,
        profilePic,
        fullName
      });

      if (response.data?.success) {
        // Password set and token generated, user is logged in
        await setAuthUser(response.data?.user);
        await connectSocket();
        toast.success(response.data?.message); // Redirect to dashboard after success
      }
    } catch (err) {
      console.error("Error in setting password", err);
    }
  };


  return (
    <div className='mt-64'>
      <h2>Set Password for {fullName}</h2>
      <form onSubmit={handlePasswordSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <button type="submit">Set Password</button>
      </form>
    </div>
  );
};

export default SetPassword;
