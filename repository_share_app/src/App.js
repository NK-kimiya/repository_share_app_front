import React, { useState,useEffect } from 'react';
import './App.css';
import './css/Login.css'
import './css/Nav.css'
import './css/Room.css'
import './css/Category.css';
import './css/Repository.css';
import './css/AiSearch.css';
import Nav from './components/Nav';
import Category from './components/Category';
import Repository from './components/Repository';
import RepositoryDetail from './components/RepositoryDetail';
import AiSearch from './components/AiSearch';
function App() {
  return (
 
    <div className="App">
      <Nav/>
      <div className='main-area'>
        <div className='repository-detail-area'>
          <RepositoryDetail/>
        </div>
        <div className='repository-list-area'>
        <Category /> 
        <Repository/>
        </div>
      </div>
    </div>
   
  );
}

export default App;


