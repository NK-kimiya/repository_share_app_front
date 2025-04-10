import {useContext,useEffect} from 'react'
import { RepositoryContext } from '../context/RepositoryProvider';
import RepositoryItem from './RepositoryItem';

const Repository = () => {
  const {
    isModalOpen, setIsModalOpen, repositoryData,
    repoUrl, setRepoUrl, title, setTitle,
    description, setDescription, demoVideo, setDemoVideo,
    RepositoryCategories, handleRepositoryCategory, createRepository,categories
} = useContext(RepositoryContext);

const openModal = () => setIsModalOpen(true);
const closeModal = () => setIsModalOpen(false);

const listRepositories = repositoryData.map(repository => {
  return <RepositoryItem key={repository.id} Repository={repository} />;
});

return (
    <div>
        <button onClick={openModal} id='repository-create-modal'>+</button>
        {isModalOpen && (
            <div style={modalOverlayStyle}>
                <div id='repository-create-area'>
                    <h2>リポジトリ作成</h2>
                    <input
                        type='text'
                        placeholder='リポジトリURL'
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                    />
                    <input
                        type='text'
                        placeholder='タイトル'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder='説明'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type='file'
                        onChange={(e) => setDemoVideo(e.target.files[0])}
                    />
                    <div id='repository-category-selected-area'>
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className='repository-category-selected-item'
                                onClick={() => handleRepositoryCategory(category.id)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: RepositoryCategories.includes(category.id) ? 'lightblue' : 'white',
                                }}
                            >
                                {category.name}
                            </div>
                        ))}
                    </div>
                    <button onClick={createRepository} id='repository-create-btn'>リポジトリ作成</button>
                    <button onClick={closeModal} id='repository-close-btn'>×</button>
                </div>
            </div>
        )}
        <div>{listRepositories}</div>
    </div>
);
}

export default Repository

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  minWidth: '300px',
  position: 'relative'
};

