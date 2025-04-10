import React,{useReducer} from 'react'
import axios from "axios";
import { withCookies } from "react-cookie";
import {
    TOGGLE_MODE,
    INPUT_EDIT,
} from './actionType'

const initialState = {
    isLoginView:true,
    credentialsLog: {
        email: "",
        password: "",
    },
};

const loginReducer = (state, action) => {
    switch (action.type) {
      case TOGGLE_MODE: {
        return {
          ...state,
          isLoginView: !state.isLoginView,
        };
      }
      case INPUT_EDIT: {
        return{
          ...state,
          credentialsLog: {
            ...state.credentialsLog,
            [action.inputName]:action.payload
          }
        };
      }
      default:
        return state;  
    }
  };
const Login = (props) => {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  
  const toggleView = () => {
    dispatch({type:TOGGLE_MODE});
  };

  const inputChangeLog = (event) => {
    dispatch({
        type:INPUT_EDIT,
        inputName:event.target.name,
        payload:event.target.value
    });
  };

  const login = async (event) => {
    event.preventDefault();
    if(state.isLoginView){
        try{
            const res = await axios.post(
              `http://127.0.0.1:8000/authen/jwt/create/`,
              state.credentialsLog,
              {
                headers:{"Content-Type": "application/json" }
              }    
            );
            props.cookies.set("jwt-token", res.data.access);
            res.data.access
            ? (window.location.href = "/app")
            : (window.location.href = "/");
        }catch{

        }
    }else{
        await axios.post(//同期処理でpost通信でアカウントを作成
            `http://127.0.0.1:8000/api/create/`,//アカウント作成のAPIエンドポイント
            state.credentialsLog,//フォームで入力した、emailとpasswordを送信
            {
              headers: { "Content-Type": "application/json" },
            }
        );

        const res = await axios.post(
            `http://127.0.0.1:8000/authen/jwt/create/`,
            state.credentialsLog,
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        props.cookies.set("jwt-token", res.data.access);
        res.data.access
        ? (window.location.href = "/room")
        : (window.location.href = "/");
    }
  };
  return (
    <div id='login-area'>
      <h1>Share</h1>
      <form id='login-area-form' onSubmit={login}>
        <input type='email'  
        name='email'
        className='login-area-form-input'
        value={state.credentialsLog.email}
        onChange={inputChangeLog}>
        </input>
        <input type='password'  
        name='password'
        className='login-area-form-input'
        value={state.credentialsLog.password}
        onChange={inputChangeLog}>
        </input>
        <a href='#' id='login-area-form-link' onClick={()=>toggleView()}>
            {state.isLoginView ? '新規作成':'ログイン'}
        </a>
        {state.isLoginView ? 
        <button className='login-area-form-button' type='submit'>ログイン</button >:
        <button className='login-area-form-button'type='submit'>新規作成</button>
        }
        
      </form>


    </div>
  )
}

export default withCookies(Login);
