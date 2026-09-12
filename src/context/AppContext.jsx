import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";
const AppContext = createContext()
import axios from 'axios'
import toast from "react-hot-toast";

axios.defaults.baseURL = "https://nexusai-backend-three.vercel.app"

export const AppContextProvider = ({children}) => {
    const navigate = useNavigate()
    const [user, setuser] = useState(null)
    const [chats, setchats] = useState([])
    const [selecteChat, setselecteChat] = useState(null)
    const [theme, settheme] = useState(localStorage.getItem('theme') || 'dark')
    const [token,settokken] = useState(localStorage.getItem('token') || null)
    const [loading, setloading] = useState(true)


    const fetchUser = async () => {
  try {
    const { data } = await axios.get("/api/user/data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data.success) {
      setuser(data.user);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  } finally {
    setloading(false);
  }
};
    const createChat = async() => {
        try {
            if(!user) return toast("Login to create chat")
            navigate('/')
            await axios.get("/api/chat/create",{headers:{Authorization:`Bearer ${token}`}})
            await fetchUsersChats()
        } catch (error) {
            toast.error(error.message)
        }
    }
const fetchUsersChats = async () => {
  try {
    const { data } = await axios.get("/api/chat/get", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      const fetchedChats = data.chats || data.chatts || [];
      setchats(fetchedChats);

      // If the user has no chats, create one
      if (fetchedChats.length === 0) {
        await createChat();
        return fetchUsersChats();
      } else {
        setselecteChat(fetchedChats[0]);
      }
    } else {
      setchats([]);
      toast.error(data.message);
    }
  } catch (error) {
    setchats([]);
    toast.error(error.message);
  }
};
    useEffect(() => {
        if(user){
            fetchUsersChats()
        } else { 
            setchats([])
            setselecteChat(null)
        }
    },[user])
    useEffect(() => {
        if(token){
            fetchUser()
        }else{
            setuser(null)
            setloading(false)
        }
    },[token])
    useEffect(() => {
        if(theme === "dark"){
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
        localStorage.setItem('theme',theme)
    },[theme])
    const value = {navigate,user,setuser,chats,setchats,selecteChat,setselecteChat,theme,settheme,loading,fetchUsersChats,token,settokken,axios}
    return (
     <AppContext.Provider value={value}>
        {children}
     </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
