import React, { useEffect, useState } from 'react';
import './SpotsFeed.css';

function SpotsFeed() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpots() {
      try {
        const response = await fetch('/api/spots');
        if (!response.ok) {
          throw new Error('Failed to fetch spots');
        }
        const data = await response.json();
        setSpots(data.spots);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpots();
  }, []);

  if (loading) {
    return <div>Loading spots...</div>;
  }

  return (
    <div className="spots-feed">
      {spots.length === 0 ? (
        <p>No spots available.</p>
      ) : (
        spots.map(spot => {
          // Determine image URL from spot data
          const imageUrl = spot.previewImage || (spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null);

          return (
            <div key={spot.id} className="spot-card" title={spot.name}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={spot.name}
                  className="spot-image"
                />
              )}
              <h3>{spot.name}</h3>
              <p className="spot-location">{spot.city}, {spot.state}</p>
              <p>{spot.description}</p>
              <p>Price: ${spot.price} night</p>
            </div>
          );
        })
      )}
    </div>
  );
}

export default SpotsFeed;
