//TODO：メッセージのデータを作成した際に、setする。
import {useState,createContext,useEffect,useContext} from 'react'
import { CategoryContext } from './CategoryProvider';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { UNSAFE_mapRouteProperties } from 'react-router-dom';
import { io } from 'socket.io-client';
import { withCookies } from 'react-cookie';
export const RepositoryContext = createContext();

const socket = io('http://localhost:4000');

const RepositoryProvider = (props) => {
  　//childrenは、コンポーネントの中の要素を表示するためのもの
    /*
    <RepositoryProvider>
      中身　→　これを表示させる
    <RepositoryProvider/>
     */
    const { children } = props;
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
    const[targetRepositoryId,setTargetRepositoryID] = useState(null);
    const[receiveMessage,setReceiveMessage] = useState(null);
    const [favoriteRepositories,setFavoriteRepositories] = useState([]);
 
    
    const {
        categories,
        selectedCategories
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
          setTargetRepositoryID(data.repository);
          setReceiveMessage(data);

          console.log("メッセージを受取ったリポジトリは",repositoryDetail);
          setRepositoryDetail(prev => {
            if (prev?.readCount != null) {
              // すでにreadCountがある → 加算
              return {
                ...prev,
                readCount: prev.readCount + 1
              };
            } else {
              // readCountがない → 初期値を1として追加
              return {
                ...prev,
                readCount: 1
              };
            }
          });
          console.log('📥 メッセージを受信:', data.readCount);
            /*setFetchMessage((prev) => [...prev, data]);  
              setRepositoryData((prev) => 
                prev.map((item) =>
                  item.id === data.repository
                   ?{...item,readCount:item.readCount + 1}
                   :item
                )
              );*/
            } 
        );
    
        //// コンポーネントがアンマウントされるときにリスナーを解除
        return () => {
          socket.off('connect');
          socket.off('receive_message');
        };
    }, []);

    useEffect(() => {
      if(receiveMessage) {
        console.log("repositoryData:",repositoryData,"receiveMessage",receiveMessage)
        if(targetRepositoryId == repositoryDetail.id) {
          RepositoryNoticeDelete();
          updateReadCountToZero(repositoryData,repositoryDetail);
          updateReadCountToZero(favoriteRepositories,repositoryDetail)
        }else {
          setFetchMessage((prev) => [...prev, receiveMessage]);  
          setRepositoryData((prev) => 
            prev.map((item) =>
              item.id === receiveMessage.repository
               ?{...item,readCount:item.readCount + 1}
               :item
            )
          );
          setFavoriteRepositories((prev) =>
            prev.map((item) =>
              item.id === receiveMessage.repository
               ?{...item,readCount:item.readCount + 1}
               :item
            )
          )
        }
      }
    },[receiveMessage])

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
        console.log("クリックしたリポジトリデータ：",repositoryDetail?.id);
        console.log("リポジトリのデータは：",repositoryDetail);
        updateReadCountToZero(repositoryData, repositoryDetail);
        updateReadCountToZero(favoriteRepositories, repositoryDetail);
        fetchMessage();
        RepositoryNoticeDelete();
        },[repositoryDetail])
    
    const handleRepositoryCategory = (categoryId) => {
        if (RepositoryCategories.includes(categoryId)) {
         setRepositoryCategories(RepositoryCategories.filter((id) => id !== categoryId));
        } else {
         setRepositoryCategories([...RepositoryCategories, categoryId]);
        }
      };
    
      const fetchRepositories = async (roomId) => {
        console.log("取得するルームのリポジトリは",roomId);
        try {
            const response = await axios.post('http://localhost:8000/api/repositories/filter/', {
                room_id: roomId
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${token} `// トークンを適切に設定
                }
            });
            console.log("一覧取得したリポジトリ",response.data);
            setRepositoryData(response.data);

            if (response.status === 200) {
                return response.data;
            } else {
                return [];
            }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 401) {

              console.warn("⚠️ トークンが無効、または期限切れです");
              Logout();
            } else {
              console.error("リクエストエラー:", error.response.data);
            }
          } else {
            console.error("Axiosリクエスト失敗:", error.message);
          }
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
          setIsModalOpen(false);
          setRepoUrl(null);
          setTitle(null);
          setDescription(null);
          setDemoVideo(null);
          setRepositoryData(prevData => [...prevData,response.data]);
        }catch (error) {
         console.log("エラー詳細", error.response?.data)
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
              console.log("取得したユーザー：",res.data.username);
              setUserName(res.data.username);
             
            } catch (err) {
              console.error(err);
            }
          };

      //メッセージのソケット通信の送信
      // // メッセージを送信する関数
      const sendMessage = (message) => {
        socket.emit('send_message', message);
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
              setFetchMessage(response.data);
              
        } catch(error) {
            console.error('メッセージ取得エラー:', error.response?.data || error.message);
        }
      }

      //通知の削除のリクエスト
      const RepositoryNoticeDelete = async () => {
        const dataToSend = {
          username: username,
          roomId: repositoryDetail?.id
        };
    
        try {
          const response = await axios.post('http://localhost:4000/delete_count', dataToSend);
          //console.log("サーバーからのレスポンス：", response.data);
        } catch (error) {
          console.error("送信エラー：", error);
        }
      };

      //詳細表示に選択したリポジトリの通知カウントを0にする
      const updateReadCountToZero = (repositoryData, repositoryDetail) => {
        for (let i = 0; i < repositoryData.length; i++) {
          if (repositoryData[i].id === repositoryDetail?.id) {
            repositoryData[i].readCount = 0;
            break; // 一致は1つだけだと想定してbreakで終了
          }
        }
      };

      //カテゴリーでリポジトリーを検索
      const RepositoryFilterCategories = () => {
        if(!selectedCategories || selectedCategories.length === 0) return;
        const params = new URLSearchParams();
        selectedCategories.forEach(id => params.append('category', id));
        params.append('room', repositoryRoom.id);
        axios.get(`http://127.0.0.1:8000/api/repositories-categorie-filter/filter_by_categories/?${params.toString()}`,{
          headers:{
            Authorization: `JWT ${token}`,
          }
        })
        .then(response => {
          setRepositoryData(response.data);
          console.log("カテゴリーでフィルターしたリポジトリ：",response.data);
        })
        .catch(error => {
          console.error('リポジトリ取得エラー:', error);
        });
      }
      
      //お気に入りリポジトリのデータを追加
      const addFavoriteRepository = async (repositoryId) => {
        try {
          const response = await axios.post(
            'http://localhost:8000/api/favorites/create/',
          { repository: repositoryId },
          {
            headers: {
              Authorization: `JWT ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setRepositoryData(prevData=>
          prevData.map(repo =>
            repo.id === repositoryId ? {...repo,favorite:true}:repo
          )
        );
        setRepositoryDetail(prev => ({
          ...prev,
          favorite: true
        }));
        console.log('お気に入り追加成功:', response.data);
        } catch (error) {
          console.error('お気に入り追加失敗:', error.response?.data || error.message);
        }
      };

      //お気に入りの一覧を取得する
      const fetchFavoriteRepositories = async () => {
        try {
          const response = await axios.get(
            'http://localhost:8000/api/favorites/',
            {
              headers: {
                Authorization: `JWT ${token}`,
              }
            }
          );
          console.log('お気に入りリスト:', response.data);
          setFavoriteRepositories(response.data);
          return response.data;
        } catch (error) {
          console.error('お気に入り取得失敗:', error.response?.data || error.message);
          return [];
        }
      };

      //リポジトリのお気に入りを解除
      const removeFavoriteRepository = async (repositoryId) => {
        try {
          const response = await axios.delete(
            'http://localhost:8000/api/favorites/delete/',
            {
              headers: {
                Authorization: `JWT ${token}`,
                'Content-Type': 'application/json',
              },
              data: {
                repository: repositoryId,
              },
            }
          );
          setRepositoryData(prevData=>
            prevData.map(repo =>
              repo.id === repositoryId ? {...repo,favorite:false}:repo
            )
          );
          setRepositoryDetail(prev => ({
            ...prev,
            favorite: false
          }));
          setFavoriteRepositories(prevData =>
            prevData.filter(repo => repo.id !== repositoryId)
          );
          setRepositoryDetail(null);
          console.log('お気に入り解除成功:', response.data);
          
        } catch (error) {
          console.error('お気に入り解除失敗:', error.response?.data || error.message);
        }
      };

      //ログアウト
      const Logout = () => {
        props.cookies.remove('jwt-token');
        localStorage.removeItem('roomData');
        window.location.href = '/';
      }
      
      return (
        <RepositoryContext.Provider value={{
            isModalOpen, setIsModalOpen, repositoryData, repoUrl, setRepoUrl,
            title, setTitle, description, setDescription, demoVideo, setDemoVideo,
            RepositoryCategories, handleRepositoryCategory, createRepository,
            fetchRepositories,categories,repositoryDetail,setRepositoryDetail,messageChange,message,messageSend,fetchmessage,RepositoryFilterCategories,repositoryRoom,
            addFavoriteRepository,fetchFavoriteRepositories,setRepositoryData,favoriteRepositories,removeFavoriteRepository
        }}>
            {children}
        </RepositoryContext.Provider>
        
    );
}

export default withCookies(RepositoryProvider)



