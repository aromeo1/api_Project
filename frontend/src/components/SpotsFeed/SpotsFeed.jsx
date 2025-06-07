import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SpotsFeed.css';

function SpotsFeed() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use effect to fetch spot data when component mounts
  useEffect(() => {
    async function fetchSpots() {
      try {
        //Fetch spot data
        const response = await fetch('/api/spots');
        if (!response.ok) {
          throw new Error('Failed to fetch spots');
        }
        //Parse JSON response
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
        //Map spots to render each spot card
        spots.map(spot => {
          //Set image url, use previewimage, if not, use first spot image
          const imageUrl = spot.previewImage || (spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null);

          return (
            <Link key={spot.id} to={`/spots/${spot.id}`} className="spot-card-link" title={spot.name}>
              <div className="spot-card" title={spot.name}>
                {imageUrl && (
                  <div className="spot-image-container">
                    <img
                      src={imageUrl}
                      alt={spot.name}
                      className="spot-image"
                    />
                    <p className="spot-location">{spot.city}, {spot.state}</p>
                  </div>
                )}
                <p>{spot.description}</p>
                <p>${spot.price} night</p>
                {spot.Reviews && spot.Reviews.length > 0 ? (
                  // Display average rating and number of reviews
                  <p className="spot-rating">
                    Rating: {(
                      spot.Reviews.reduce((sum, review) => sum + review.stars, 0) / spot.Reviews.length).toFixed(1)} ★ &middot; ({spot.Reviews.length} {spot.Reviews.length === 1 ? 'Review' : 'Reviews'})
                  </p>
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
