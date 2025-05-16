import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './SpotDetails.css';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpotDetails() {
      try {
        const response = await fetch(`/api/spots/${spotId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch spot details');
        }
        const data = await response.json();
        setSpot(data);
        console.log('Spot data:', data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpotDetails();
  }, [spotId]);

  if (loading) {
    return <div>Loading spot details...</div>;
  }

  if (!spot) {
    return <div>Spot not found.</div>;
  }

  const mainImage = spot.previewImage || (spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null);

  return (
    <div className="spot-details">
      <div className="spot-main-info">
        <h2>{spot.name}</h2>
        {mainImage && (
          <img src={mainImage} alt={spot.name} className='spot-main-image' />
        )}
        <p>{spot.city}, {spot.state}, {spot.country}</p>
        <p>{spot.description}</p>
        <p>Hosted by: {spot.Owner ? `${spot.Owner.firstName} ${spot.Owner.lastName}` : 'Unknown'}</p>
      </div>
      <div className="spot-callout-box">
        <p className="spot-price">${spot.price} night</p>
        <button className="reserve-button" onClick={() => alert('<Feature coming soon>')}>Reserve</button>
      </div>
    </div>
  );
}

export default SpotDetails;
