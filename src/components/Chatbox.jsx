import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import darkimage from '../assets/logo_full_dark.png'
import lightimage from '../assets/logo_full.png'
import Message from './Message'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

const Chatbox = () => {
  const { selecteChat, setselecteChat, chats, theme, axios, token, fetchUsersChats } = useAppContext()
  const [messages, setmessages] = useState([])
  const [loading, setloading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (selecteChat) {
      setmessages(selecteChat.messages || [])
    } else {
      setmessages([])
    }
  }, [selecteChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    let currentChat = selecteChat
    if (!currentChat) {
      if (chats && chats.length > 0) {
        currentChat = chats[0]
        setselecteChat(chats[0])
      } else {
        try {
          const createRes = await axios.get("/api/chat/create", { headers: { Authorization: `Bearer ${token}` } })
          if (createRes.data.success) {
            const fresh = await axios.get("/api/chat/get", { headers: { Authorization: `Bearer ${token}` } })
            const newChats = fresh.data.chats || fresh.data.chatts || []
            setchats(newChats)
            if (newChats.length > 0) {
              currentChat = newChats[0]
              setselecteChat(newChats[0])
            }
          }
        } catch (err) {
          toast.error("Could not initialize chat session")
          return
        }
      }
    }

    if (!currentChat) {
      toast.error("Unable to create chat. Please try again.")
      return
    }

    try {
      setloading(true)
      const userPrompt = prompt.trim()
      setPrompt("")

      setmessages((prev) => [
        ...prev,
        { role: "user", content: userPrompt, timestamp: Date.now(), isImage: false }
      ])

      const { data } = await axios.post(
        "/api/message/text",
        { chatId: currentChat._id, prompt: userPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        await fetchUsersChats()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setloading(false)
    }
  }

  return (
    <main className='flex-1 flex flex-col justify-between h-full p-3 sm:p-6 md:p-8 max-md:pt-14 w-full max-w-5xl mx-auto'>
      <div className='flex-1 mb-4 overflow-y-scroll pr-1 scroll-smooth'>
      {messages.length === 0 && (
        <section aria-label="Welcome section" className='flex justify-center flex-col items-center h-full gap-2 text-primary px-4'>
          <div className='flex flex-row items-center gap-2'>
            <img 
              src={theme === "dark" ? darkimage : lightimage} 
              alt="Nexus AI Logo"
              className='w-20 sm:w-28 h-20 sm:h-28 object-contain'
            />
            <div className='flex flex-col items-start justify-center'>
              <h1 className={theme === 'dark' ? 'text-2xl sm:text-3xl text-white font-semibold' : 'text-2xl sm:text-3xl text-black font-medium'}>Nexus Ai</h1> 
              <p className={theme === 'dark' ? 'text-xs sm:text-sm text-[#0A9BFF] font-light' : 'text-xs sm:text-sm text-[#1DA1FF] font-light'}>Your Intelligent AI Assistant</p>
            </div>
          </div>
          <h2 className='text-2xl sm:text-4xl mt-4 text-center text-gray-400 dark:text-white font-medium'>Ask Me Anything</h2>
        </section>
      )}

      {messages.map((message, idx) => (
        <Message key={idx} message={message} />
      ))}

      {loading && (
        <div aria-live="polite" className="flex items-start justify-start my-3 sm:my-4 gap-2">
          <img
            src={assets.logo_full_dark || assets.user_icon}
            alt="Nexus AI Thinking"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain bg-purple-900/40 p-1 border border-purple-500/20 animate-pulse shrink-0 mt-0.5"
          />
          <div className="flex items-center gap-2 p-2.5 px-3.5 sm:p-3 sm:px-4 bg-primary/10 dark:bg-[#57317C]/30 border border-primary/30 dark:border-[#80609F]/30 rounded-2xl rounded-tl-none">
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
            </div>
            <span className="text-xs text-gray-500 dark:text-purple-300 ml-1 font-medium">Nexus AI is generating response...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmitHandler} aria-label="Chat input form" className='flex gap-2 sm:gap-4 items-center bg-primary/10 dark:bg-[#583C79]/30 border border-primary/40 dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-2.5 sm:p-3 pl-4 mx-auto shadow-sm'>
        <input
          type="text"
          placeholder="Type your prompt here..."
          value={prompt}
          aria-label="Prompt message"
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 w-full text-[16px] sm:text-sm outline-none bg-transparent dark:text-white text-gray-800 placeholder:text-gray-400"
          required
        />

        <button 
          type="submit" 
          disabled={loading} 
          aria-label={loading ? "Generating response" : "Send prompt"}
          className="shrink-0 p-1"
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt={loading ? "Generating response" : "Send icon"}
            className="w-7 h-7 sm:w-8 sm:h-8 cursor-pointer hover:scale-105 transition-transform"
          />
        </button>
      </form>
    </main>
  )
}

export default Chatbox
