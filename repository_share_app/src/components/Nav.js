import React from 'react'
import {LuLogOut} from "react-icons/lu";
import { withCookies } from 'react-cookie';

const Nav = (props) => {
  const Logout = () => {
    props.cookies.remove('jwt-token');
    localStorage.removeItem('roomData');
    window.location.href = '/';
  }
  return (
    <nav>
       <h1>Share</h1>
       <button onClick={Logout}>ログアウト</button>
       <div className='sub-nav-area'>
        <ul>
          <li><a href='/app'>ルームTOP</a></li>
          <li><a href='/ai-search'>AI検索<small>BETA</small></a></li>
          <li><a href='/favorite'>お気に入り</a></li>
          <li><a href='#'>ルーム退出</a></li>
        </ul>
       </div>
    </nav>
  )
}

export default withCookies(Nav)
