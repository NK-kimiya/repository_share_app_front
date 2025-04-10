import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {Routes, Route, BrowserRouter} from 'react-router-dom'
import Login from './components/Login';
import RequireAuth from './components/RequireAuth';
import { CookiesProvider } from 'react-cookie';
import Room from './components/Room';
import RoomProvider from './context/RoomProvider';
import CategoryProvider from './context/CategoryProvider';
import RepositoryProvider from './context/RepositoryProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RoomProvider>
    <CategoryProvider>
      <RepositoryProvider>
    <BrowserRouter>
      <CookiesProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/room" element={<Room />}/>
          <Route
            path="/app"
            element={
              <RequireAuth>
                <App />
              </RequireAuth>
            }
          />
        </Routes>
      </CookiesProvider>
    </BrowserRouter>
    </RepositoryProvider>
    </CategoryProvider>
    </RoomProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
