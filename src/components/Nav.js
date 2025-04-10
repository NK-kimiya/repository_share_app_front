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
    </nav>
  )
}

export default withCookies(Nav)
