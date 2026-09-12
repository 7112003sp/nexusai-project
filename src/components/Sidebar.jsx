import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { CiDark, CiDeliveryTruck, CiLight, CiSearch, CiUser } from "react-icons/ci";
import { IoClose, IoDiamond, IoLogOut } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sidebar = ({ismenuopen,setismenuopen}) => {
  const navigate = useNavigate()
  const {chats,setselecteChat,theme,settheme,user,setuser,settokken,axios,token,fetchUsersChats} = useAppContext()
  const [search, setsearch] = useState("")

  const handleCreateChat = async () => {
    try {
      if(!user) return toast("Login to create chat")
      navigate('/')
      const { data } = await axios.get("/api/chat/create",{headers:{Authorization:`Bearer ${token}`}})
      if(data.success) {
        await fetchUsersChats()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation()
    try {
      const { data } = await axios.post("/api/chat/delete", { chatId }, { headers: { Authorization: `Bearer ${token}` } })
      if(data.success) {
        await fetchUsersChats()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    settokken(null)
    setuser(null)
    toast.success("Logged out successfully")
  }

  return  (
    <>
   <div className={`flex h-screen flex-col md:min-w-72 min-w-84 p-4 dark:bg-linear-to-b
    from=[#242124]/30 to-[#000000] border-r border-[#80609F]/30 max-md:fixed max-md:left-0 max-md:top-0 z-50 backdrop-blur-3xl
    transition-transform duration-500 ${ismenuopen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>
      <div className='flex flex-row gap-1.5'>
      <img className='w-16 h-16 object-contain cursor-pointer ' 
      src={theme === "dark" ? assets.logo_full_dark : assets.logo_full}/>
      <div className='flex h-16 justify-center gap-0.5 flex-col'>
      <p className={theme === 'dark' ? 'text-2xl text-white font-semibold' : 'text-2xl text-black font-medium'}>Nexus Ai</p> 
      <p className={theme === 'dark' ? 'text-sm text-[#0A9BFF] font-light' : 'text-sm text-[#1DA1FF] font-light'}>Your Intelligent AI Assistant</p>
      </div>
      </div>
      <button onClick={handleCreateChat} className='bg-[#0A9BFF] w-full text-white flex justify-center text-sm items-center cursor-pointer h-10 py-4 mt-10  rounded-md'>+ New Chat</button>
      <div className='flex items-center gap-2 p-2 w-full mt-4 border border-gray-400 dark:border-white/20 rounded-md '>
        <CiSearch className='text-2xl dark:text-white'/>
        <input onChange={(e) => setsearch(e.target.value)} value={search} type='text' placeholder='Search coversations' className='text-xs placeholder:text-gray-400 outline-none'/>
      </div>
      {(chats || []).length > 0 && <p className='mt-4 text-sm'>Recent Chats</p>}
      <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3'>
       {
        (chats || []).filter((chat) => chat.messages && chat.messages[0] ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase()) : (chat.name || '').toLowerCase().includes(search.toLowerCase()))
        .map((chat,id) => (
        <div onClick={() => {navigate('/');setismenuopen(false);setselecteChat(chat) }} key={id} className='p-2 px-4 dark:bg-[#57317C]/10 border
          border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer items-center flex justify-between group'>
          <div>
            <p>
              {chat.messages && chat.messages.length > 0 ? chat.messages[0].content.slice(0,32) : chat.name}
            </p>
            <p>{moment(chat.updatedAt).fromNow()}</p>
            </div>
            <MdDelete onClick={(e) => handleDeleteChat(e, chat._id)} className= {theme == 'dark' ? 'text-xl hidden group-hover:block text-white' : 'text-xl  hidden group-hover:block'}/>
        </div>
      ))
       }
      </div>
       <div onClick={() => {navigate('/credits'); setismenuopen(false)}} className='flex flex-row  mt-4 hover:scale-103 transition-transform duration-75 cursor-pointer items-center border border-gray-300 dark:border-white/15 rounded-md p-3 gap-2 '>
         <IoDiamond className="text-xl text-black dark:text-white" />
        <div>
       <p>Credits: {user?.credits}</p>
       <p className='text-xs font-light'>Purchase credits to use quickgpt</p>
       </div>
       </div>
      <div className='flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md'>
  <div className='flex items-center gap-2 text-sm'>
    <img
      src={assets.theme_icon}
      className='w-4 not-dark:invert'
      alt=""
    />
    <p>Dark Mode</p>
  </div>

  <label className='relative inline-flex cursor-pointer'>
    <input
      onChange={() => settheme(theme === 'dark' ? 'light' : 'dark')}
      type="checkbox"
      className="sr-only peer"
      checked={theme === 'dark'}
    />

    <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all'></div>

    <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
  </label>
</div>
<div className='flex flex-row justify-between mt-4 cursor-pointer items-center border border-gray-300 dark:border-white/15 group rounded-md p-3 gap-2 '>
         <CiUser/>
         <p className=' flex-1 truncate dark:text-primary text-sm'>{user ? user.name : "Login your account"}</p>
        <div>
       
      {user && <IoLogOut onClick={handleLogout} className='text-xl hidden  group-hover:block'/>}
       </div>
       </div>
       <IoClose onClick={() => setismenuopen(false)} className='fixed top-3 right-3 text-4xl cursor-pointer md:hidden'/>
    </div>
    </>
  )
}

export default Sidebar
