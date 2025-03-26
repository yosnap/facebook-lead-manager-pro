import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

interface Profile {
  name: string;
  profileUrl: string;
  type: 'people' | 'pages' | 'groups';
}

const Popup: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [searchType, setSearchType] = useState<'people' | 'pages' | 'groups'>('people');
  const [isSearching, setIsSearching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    // Escuchar mensajes del content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'PROFILE_FOUND') {
        setProfiles(prev => [...prev, message.data]);
      }
      return true;
    });
  }, []);

  const startSearch = () => {
    setProfiles([]);
    setIsSearching(true);
    setIsPaused(false);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'START_SEARCH',
          data: { searchTerm, searchType, city }
        });
      }
    });
  };

  const stopSearch = () => {
    setIsSearching(false);
    setIsPaused(false);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'STOP_SEARCH' });
      }
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          action: isPaused ? 'RESUME_SEARCH' : 'PAUSE_SEARCH'
        });
      }
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ margin: '0 0 16px', fontSize: '24px', color: '#1a73e8' }}>
        Facebook Lead Manager Pro
      </h1>

      <div style={{ marginBottom: '16px' }}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as 'people' | 'pages' | 'groups')}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="people">Buscar Personas</option>
          <option value="pages">Buscar Páginas</option>
          <option value="groups">Buscar Grupos</option>
        </select>

        <input
          type="text"
          placeholder="Término de búsqueda"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="text"
          placeholder="Ciudad (opcional)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {!isSearching ? (
            <button
              onClick={startSearch}
              disabled={!searchTerm}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: searchTerm ? 'pointer' : 'not-allowed',
                opacity: searchTerm ? 1 : 0.7
              }}
            >
              Iniciar búsqueda
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: '#f9a825',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isPaused ? 'Reanudar' : 'Pausar'}
              </button>
              <button
                onClick={stopSearch}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Detener
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px' }}>
          Resultados ({profiles.length})
        </h2>
        {profiles.map((profile, index) => (
          <div
            key={profile.profileUrl}
            style={{
              padding: '8px',
              marginBottom: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>
                {index + 1}. {profile.name}
              </span>
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#1a73e8',
                  textDecoration: 'none'
                }}
              >
                Ver perfil
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);