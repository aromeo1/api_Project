import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
          const imageUrl = spot.previewImage || (spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null);

          return (
            <Link key={spot.id} to={`/spots/${spot.id}`} className="spot-card-link" title={spot.name}>
            <div className="spot-card">
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
              <p>Price: ${spot.price}</p>
              {spot.Reviews && spot.Reviews.length > 0 ? (
              <p className="spot-rating">
                 Rating: {(
                    spot.Reviews.reduce((sum, review) => sum + review.stars, 0) / spot.Reviews.length).toFixed(1)} ★ &middot; ({spot.Reviews.length} {spot.Reviews.length === 1 ? 'Review' : 'Reviews'})</p>
                    ) : (<p className="spot-rating">New</p>)}
            </div>
          </Link>
          
          );
        })
      )}
    </div>
  );
}

export default SpotsFeed;
