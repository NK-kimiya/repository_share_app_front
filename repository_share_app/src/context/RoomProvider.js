// RoomProvider.js
import React, { createContext, useEffect, useReducer, useState,useCookies } from 'react';
import axios from 'axios';
import { TOGGLE_MODE, INPUT_EDIT } from '../components/actionType';
// ✅ Context を作成
export const RoomContext = createContext();



// ✅ 初期状態
const initialState = {
  isEnteringView: true,
  credentialsLog: {
    name: '',
    password: '',
  },
};

// ✅ reducer関数（モード切替・入力フィールド編集）
const roomReducer = (state, action) => {
  
  
  switch (action.type) {
    case TOGGLE_MODE:
      return {
        ...state,
        isEnteringView: !state.isEnteringView,
      };
    case INPUT_EDIT:
      return {
        ...state,
        credentialsLog: {
          ...state.credentialsLog,
          [action.inputName]: action.payload,
        },
      };
    default:
      return state;
  }
};

// ✅ RoomProviderコンポーネント
const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roomReducer, initialState);
  const [roomData, setRoomData] = useState(null);

  // ✅ モード切り替え関数
  const toggleView = () => {
    dispatch({ type: TOGGLE_MODE });
  };

  // ✅ 入力フィールド編集関数
  const inputChangeLog = (event) => {
    dispatch({
      type: INPUT_EDIT,
      inputName: event.target.name,
      payload: event.target.value,
    });
  };


  // ✅ 入室・新規作成API処理
  const entering = async (event, token) => {
    event.preventDefault();
    localStorage.removeItem('roomData');

    try {
      let res;

      if (state.isEnteringView) {
        // ✅ 入室処理（ルーム取得）
        res = await axios.post(
          `http://127.0.0.1:8000/api/rooms/filter/`,
          { password: state.credentialsLog.password },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `JWT ${token}`,
            },
          }
        );
      } else {
        // ✅ 新規作成処理
        await axios.post(
          `http://127.0.0.1:8000/api/rooms/`,
          state.credentialsLog,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `JWT ${token}`,
            },
          }
        );

        // ✅ 作成後、再度フィルターで取得
        res = await axios.post(
          `http://127.0.0.1:8000/api/rooms/filter/`,
          state.credentialsLog,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `JWT ${token}`,
            },
          }
        );
      }

      // ✅ データが取得できた場合
      if (res.data[0]?.id) {
        const roomData = {id:res.data[0].id,name:res.data[0].name}
        console.log("ログインしたルームは：",res.data[0].name);
        console.log("ログインしたルームIDは：",res.data[0].id);
        localStorage.setItem('roomData',JSON.stringify(roomData));
        setRoomData(res.data[0]);  // ✅ roomDataにセット
        window.location.href = '/app';
        return true;               // ✅ 成功を返す
      } else {
        return false;              // ✅ 失敗を返す
      }
    } catch (error) {
      window.location.href = '/room';
      console.error('エラー:', error);
      return false;
    }
  };



  // ✅ Context を値として渡す
  return (
    <RoomContext.Provider
      value={{
        state,
        roomData,
        toggleView,
        inputChangeLog,
        entering,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
