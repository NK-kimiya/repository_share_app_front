//TODO：メッセージのデータを作成した際に、setする。
import {useState,createContext,useEffect,useContext} from 'react'
import { CategoryContext } from './CategoryProvider';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { UNSAFE_mapRouteProperties } from 'react-router-dom';
import { io } from 'socket.io-client';

export const RepositoryContext = createContext();

const socket = io('http://localhost:4000');

const RepositoryProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [repositoryData, setRepositoryData] = useState([]);
    const [repositoryRoom, setRepositoryRoom] = useState('');
    const [repoUrl, setRepoUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [demoVideo, setDemoVideo] = useState('');
    const [RepositoryCategories, setRepositoryCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [repositoryDetail,setRepositoryDetail] = useState(null);
    const [message,setMessage] = useState('');//チャットのメッセージ
    const [fetchmessage,setFetchMessage] = useState([]);
    const [socketmessage, setSocketMessage] = useState('');
    const[username,setUserName] = useState(null);
    
    const {
        categories,
      } = useContext(CategoryContext);
    
    const [cookies] = useCookies(['jwt-token']);
    const token = cookies['jwt-token'];
    useEffect(() => {
        const storedData = localStorage.getItem('roomData');
        if (storedData) {
            setRepositoryRoom(JSON.parse(storedData));
        }
        fetchCurrentUser();

        socket.on('connect', () => {
          console.log('✅ 接続しました:', socket.id);
        });
    
        // メッセージ受信
        socket.on('receive_message', (data) => {
          console.log('📥 メッセージを受信:', data.readCount);
            setFetchMessage((prev) => [...prev, data]);
          setRepositoryData((prev) => 
            prev.map((item) =>
              item.id === data.repository
               ?{...item,readCount:item.readCount + 1}
               :item
            )
          );
         
        });
    
        //// コンポーネントがアンマウントされるときにリスナーを解除
        return () => {
          socket.off('connect');
          socket.off('receive_message');
        };
    }, []);

    useEffect(() => {
        if (repositoryRoom?.id) {
            fetchRepositories(repositoryRoom.id);
        }
      }, [repositoryRoom]);

      useEffect(() => {
        console.log("取得したリポジトリデータ"+repositoryData[0]);
        if (repositoryData.length > 0 && username) {
          const idList = repositoryData.map(item => item.id);
      
          axios.post('http://localhost:4000/create-read-status', {
            roomId: idList, // ← 必要に応じて最初の1つだけでもOK
            username: username,
            readCount: 0
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(res => {
            console.log('MongoDBへ送信成功:', res.data);
          })
          .catch(err => {
            console.error('MongoDBへの送信失敗:', err.response ? err.response.data : err);
          });
        }
      }, [repositoryData, username]); // 依存に含める

     //メッセージを取得する関数
    useEffect(() => {
        fetchMessage();
        },[repositoryDetail])
    
    const handleRepositoryCategory = (categoryId) => {
        if (RepositoryCategories.includes(categoryId)) {
         setRepositoryCategories(RepositoryCategories.filter((id) => id !== categoryId));
        } else {
         setRepositoryCategories([...RepositoryCategories, categoryId]);
        }
      };
    
      const fetchRepositories = async (roomId) => {
        try {
            const response = await axios.post('http://localhost:8000/api/repositories/filter/', {
                room_id: roomId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${token} `// トークンを適切に設定
                }
            });
            setRepositoryData(response.data);

            if (response.status === 200) {
                return response.data;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    };
    
    const createRepository = async () => {
        const formData = new FormData();
        formData.append('url', repoUrl);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('room', repositoryRoom.id);
        if (demoVideo) {
            formData.append('demo_video', demoVideo, demoVideo.name);  // ファイルを追加
        }
        RepositoryCategories.forEach(cat => {
            formData.append('categories', cat);  // 各カテゴリIDを追加
        });
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/repositories/',formData,{
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `JWT ${token}`,
                },
              });
        }catch (error) {
         console.log(error)
        }
      }

      //送信するメッセージ内容を取得する関数
      const messageChange = (e) => {
        const newText = e.target.value;
        setMessage(newText);
      }

      //メッセージを送信する関数
      const messageSend = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/messages/create/',{
                content:message,
                repository:repositoryDetail.id
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${token}`, // トークンをヘッダーに追加
                  },
            }
            
           );
           
           const newMessage = response.data;
           let formattedDate = '';
if (newMessage.created_at) {
  const parsedDate = new Date(newMessage.created_at);
  if (!isNaN(parsedDate)) {
    formattedDate = parsedDate.toLocaleString('ja-JP');
  } else {
    console.warn('⚠️ 日付形式が不正です:', newMessage.created_at);
  }
}
           const formattedMessage = {
            id: newMessage.id || '', // IDがないなら空文字
            content: newMessage.content,
            repository: newMessage.repository,
            user_name: newMessage.user_name,
            created_at:formattedDate
          };
          sendMessage(formattedMessage);
          setMessage('');
        } catch(error){
            console.error('送信エラー:', error.response?.data || error.message);
        }
      }

      //ユーザー名を取得
          const fetchCurrentUser = async () => {
            try {
              const res = await axios.get('http://127.0.0.1:8000/api/user/current/', {
                headers: {
                  Authorization: `JWT ${token}`,
                },
              });
              console.log(res.data.username); // ← ユーザー名が表示される
              setUserName(res.data.username);
            } catch (err) {
              console.error(err);
            }
          };

      //メッセージのソケット通信の送信
      // // メッセージを送信する関数
      const sendMessage = (message) => {
        socket.emit('send_message', message);
        console.log('📤 メッセージを送信:', message);
      };



      const fetchMessage = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/messages/repository/${repositoryDetail.id}/`,
                {
                  headers: {
                    Authorization: `JWT ${token}`,
                  },
                }
              );
              console.log("取得したメッセージ：",response.data);
              setFetchMessage(response.data);
              
        } catch(error) {
            console.error('メッセージ取得エラー:', error.response?.data || error.message);
        }
      }
    
      
      return (
        <RepositoryContext.Provider value={{
            isModalOpen, setIsModalOpen, repositoryData, repoUrl, setRepoUrl,
            title, setTitle, description, setDescription, demoVideo, setDemoVideo,
            RepositoryCategories, handleRepositoryCategory, createRepository,
            fetchRepositories,categories,repositoryDetail,setRepositoryDetail,messageChange,message,messageSend,fetchmessage
        }}>
            {children}
        </RepositoryContext.Provider>
        
    );
}

export default RepositoryProvider



