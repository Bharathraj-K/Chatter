import { createContext, use, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    cosnt [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket,axios} = useContext(AuthContext);

    //function to get all the users for sidebar 

    const getUsers = async () => {
        try {
            const {data} = await axios.get('/api/messages/users');
            if(data.success){
                setUsers(data.user);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error();
        }
    }

    //function to get messages for selected user
    const getMessages = async (userId)=> {
        try{
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
            }
        }catch(error){
            toast.error(error.message);
        }
    }

    //function to send message to selected users
    const sendMessage = async (messageData)=>{
        try{
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessages]);
            }else{
                toast.error(data.message);
            }
        }catch (error){
            toast.error(error.message);
        }
    }

    //function to subscribe to message for selected userr
    const subscribeToMessages = async()=>{
        if(!socket) return;
        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages, newMessage]);
                axios.puth(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages
                    [newMessage.senderId] + 1 : 1
                }))
            }

        })
    }
    
    const value = {

    }

    return (
        <ChatContext.Provider>
            {children}
        </ChatContext.Provider>
    )
}