import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProvince, setExpandedProvince] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [prayerData, setPrayerData] = useState(null);
  const [loadingPrayer, setLoadingPrayer] = useState(false);

  useEffect(() => {
    fetch('/province')
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleProvince = (id) => {
    setExpandedProvince(expandedProvince === id ? null : id);
  };

  const fetchPrayerTimes = async (city) => {
    setSelectedCity(city);
    setLoadingPrayer(true);
    try {
      const res = await fetch(`/prayer?latitude=${city.coordinate.latitude}&longitude=${city.coordinate.longitude}`);
      const data = await res.json();
      setPrayerData(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingPrayer(false);
  };

  const closeModal = () => {
    setSelectedCity(null);
    setPrayerData(null);
  };

  const filteredProvinces = provinces.filter(province =>
    province.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="App">
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading provinces...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="App">
      <div className="error">
        <span className="error-icon">⚠️</span>
        <p>Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="App">
      <div className="background-pattern"></div>
      <header className="header">
        <div className="header-content">
          <h1>Muslim Apps</h1>
          <p>Explore Provinces & Cities of Indonesia</p>
        </div>
      </header>
      <div className="container">
        <div className="search-box">
          
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Search provinces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{filteredProvinces.length}</div>
            <div className="stat-label">Provinces</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredProvinces.reduce((acc, p) => acc + p.cities.length, 0)}</div>
            <div className="stat-label">Cities</div>
          </div>
        </div>
        {filteredProvinces.map(province => (
          <div key={province.id} className="province-card">
            <div 
              className="province-header" 
              onClick={() => toggleProvince(province.id)}
            >
              <h2>{province.name}</h2>
              <span className="toggle-icon">
                {expandedProvince === province.id ? '▼' : '▶'}
              </span>
            </div>
            {expandedProvince === province.id && (
              <div className="cities-list">
                <div className="cities-count">{province.cities.length} cities found</div>
                <div className="cities-grid">
                  {province.cities.map(city => (
                    <div key={city.id} className="city-item" onClick={() => fetchPrayerTimes(city)}>
                      <div className="city-name">{city.name}</div>
                      <div className="city-coords">
                        📍 {city.coordinate.latitude.toFixed(4)}, {city.coordinate.longitude.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedCity && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2 className="modal-title">🕌 Prayer Times</h2>
            <h3 className="modal-city">{selectedCity.name}</h3>
            {loadingPrayer ? (
              <div className="modal-loading">
                <div className="spinner-small"></div>
                <p>Loading prayer times...</p>
              </div>
            ) : prayerData && (
              <div className="prayer-list">
                {prayerData.prayers.slice(0, 7).map((prayer) => (
                  <div key={prayer.id} className="prayer-day">
                    <div className="prayer-date">{prayer.date}</div>
                    <div className="prayer-times">
                      {Object.entries(prayer.time).map(([name, time]) => (
                        <div key={name} className="prayer-time-item">
                          <span className="prayer-name">{name}</span>
                          <span className="prayer-time">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
