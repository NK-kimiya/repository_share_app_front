import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

export const CategoryContext = createContext();

const CategoryProvider = ({children}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputCategoryName, setInputCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [roomData, setRoomData] = useState(null);
  
  //JWT トークンの取得
  const [cookies] = useCookies(['jwt-token']);
  const token = cookies['jwt-token'];
  
  //初期化処理
  useEffect(() => {
    const storedData = localStorage.getItem('roomData');
    if (storedData) {
      setRoomData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (roomData?.id) {
      fetchCategories(roomData.id);
    }
  }, [roomData]);

  //カテゴリ取得
  const fetchCategories = async (roomId) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/categories/filter/',
        { room_id: roomId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
        }
      );
      setCategories(response.data);
    } catch (error) {

    }
  };

  //カテゴリ作成
  const createCategory = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/categories/',
        {
          name: inputCategoryName,
          room: roomData.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
        }
      );
      setInputCategoryName('');
      setCategories([...categories, response.data]);
      closeModal();
    } catch (error) {
      console.error('カテゴリ作成エラー:', error.response?.data || error.message);
    }
  };

  //カテゴリクリック
  const handleCategoryClick = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  return (
    <CategoryContext.Provider
      value={{
        categories,
        selectedCategories,
        setSelectedCategories,
        handleCategoryClick,
        isModalOpen,
        openModal,
        closeModal,
        inputCategoryName,
        setInputCategoryName,
        createCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export default CategoryProvider
