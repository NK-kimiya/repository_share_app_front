import React,{useState,useEffect, use} from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';
import { CiChat2 } from "react-icons/ci";
import Nav from './Nav';

const AiSearch = () => {
  const [title,setTitle] = useState('')
  const [result,setResult] = useState(null)
  const [errorMessage,setErrorMessage] = useState(null);
  //プログレスバーのテストコード
  const setProgress = (percent) => {
    const circle = document.querySelector('.progress-ring__circle');
    const text = document.getElementById('progress-text');

    const radius = 50;
    //円周 = 2πr。ここでは
    const circumference = 2 * Math.PI * radius;
    //どれだけ円を「塗らないか」を決める
    const offset = circumference - (percent / 100) * circumference;
            
    //実際に円の見え方を更新
    circle.style.strokeDashoffset = offset;
    // 数字の表示も更新
    text.textContent = `${percent}%`;
  }

  let progress = 0;
  
  const handleSearch = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/gitprojects/search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title }),
      });
      
      if (!response.ok) {
        throw new Error('リクエストに失敗しました');
      }

      const data = await response.json();
      console.log("AI検索の結果",data);
      setResult(data);
      const percentData = data.predicted_probability * 100;
      const interval = setInterval(() => {
        //100%に達したらカウントアップ終了
      if (progress > Math.round(percentData * 10) / 10) {
        clearInterval(interval);
        return;
      }
    
      setProgress(progress);
      progress++;
      },30);

      setErrorMessage(null);

    } catch (error) {
      setResult(null);
      console.error('エラー:', error);
      setErrorMessage("予測に失敗しました。入力テキストが記入されていません。");
    }
  };
  return (
    <div>
      <Nav/>
          <div className='AiSearchProject-area'>
          <h2>GitProject 検索</h2>
          <textarea
          placeholder='例：オンデマンドの教育サービスを作成したいです。'
          value={title}
          onChange={(e) => setTitle(e.target.value)}></textarea>
          
          <button onClick={handleSearch} className='search-button'>
            検索
          </button>
          <p className='error_message'>{errorMessage}</p>
          {result && (
            <div style={{ marginTop: '20px' }}>
              <h3>一致するプロジェクト：{result.predicted_category}</h3>
              <div className='progress-container'>
              <svg className='progress-ring' width={120} height={120}>
                <circle className='progress-ring__circle' stroke='#3cb371' stroke-width="10" fill="transparent" r="50" cx="60" cy="60"></circle>
              </svg>
              <div class="progress-text" id="progress-text">0%</div>
            </div>
      
              {result.projects.length > 0 ? (
                <ul>
                  {result.projects.map((project) => (
                    <li key={project.id}>
                      <div className='search-result-item'>
                      <p>{project.text}</p>
                      {project.subheading1 && (
                        <>
                          <h5>{project.subheading1}</h5>
                          <p>
                              <a href={project.url1} target="_blank" rel="noopener noreferrer">
                                {project.url1}
                              </a>
                          </p>
                        </>
                      )}
                      {project.subheading2 && (
                        <>
                          <h5>{project.subheading2}</h5>
                          <p>
                              <a href={project.url2} target="_blank" rel="noopener noreferrer">
                                {project.url2}
                              </a>
                          </p>
                        </>
                      )}

                      {project.subheading3 && (
                        <>
                          <h5>{project.subheading3}</h5>
                          <p>
                              <a href={project.url3} target="_blank" rel="noopener noreferrer">
                                {project.url3}
                              </a>
                          </p>
                        </>
                      )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='result-message'>該当プロジェクトはありません。</p>
              )}
              
            </div>
          )}
        </div>
     
      
    </div>
    
  )
}

export default AiSearch
