import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Loading = () => {
  const navigate = useNavigate()
  console.log("hi");
  
  useEffect(() => {
    let timeout;
    if (window.location.pathname === '/loading') {
      timeout = setTimeout(() => {
        navigate('/');
      }, 2000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [navigate]);
  return (
  <div className="bg-gradient-to-b from-[#531B81] to-[#29184B] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl">
    <div className="w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin"></div>
  </div>
)
}

export default Loading
