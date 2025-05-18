import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useModal } from '../../components/context/useModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { csrfFetch } from '../../store/csrf';
import './ManageSpots.css';

function ManageSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spotToDelete, setSpotToDelete] = useState(null);
  const { setModalContent, closeModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserSpots() {
      try {
        const response = await fetch('/api/spots/current');
        if (!response.ok) {
          throw new Error('Failed to fetch user spots');
        }
        const data = await response.json();
        setSpots(data.spots || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSpots();
  }, []);

  const confirmDelete = (spot) => {
    console.log('Confirm delete called for spot id:', spot.id);
    setSpotToDelete(spot);
    setModalContent(
      <ConfirmDeleteModal
        onConfirm={handleDelete}
        onCancel={() => {
          setSpotToDelete(null);
          closeModal();
        }}
      />
    );
  };

  const handleDelete = async () => {
    if (!spotToDelete) return;
    try {
      console.log('Sending DELETE request for spot id:', spotToDelete.id);
      const response = await csrfFetch(`/api/spots/${spotToDelete.id}`, {
        method: 'DELETE',
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete spot:', errorText);
        throw new Error('Failed to delete spot');
      }
      const data = await response.json();
      console.log('Delete response data:', data);
      setSpots(spots.filter(spot => spot.id !== spotToDelete.id));
      setSpotToDelete(null);
      closeModal();
      navigate('/'); // Navigate to home page after deletion
    } catch (error) {
      console.error('Error deleting spot:', error);
      alert('Error deleting spot');
    }
  };

  const handleUpdate = (spotId) => {
    navigate(`/spots/${spotId}/edit`);
  };

  if (loading) {
    return <div>Loading your spots...</div>;
  }

  return (
    <div className="manage-spots-container">
      <h1>Manage Your Spots</h1>
      <NavLink to="/spots/new" className="create-spot-button">Create a New Spot</NavLink>
      {spots.length === 0 ? (
        <p>You have no spots yet.</p>
      ) : (
        <div className="spots-feed">
          {spots.map((spot, index) => {
            const imageUrl = spot.previewImage || (spot.SpotImages && spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null);

            return (
              <Link key={spot.id} to={`/spots/${spot.id}`} className="spot-card-link" title={spot.name}>
                <div className="spot-card" title={spot.name} data-index={index}>
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
                  <p>Price: ${spot.price}</p>
                  {spot.Reviews && spot.Reviews.length > 0 ? (
                    <p className="spot-rating">
                      Rating: {(
                        spot.Reviews.reduce((sum, review) => sum + review.stars, 0) / spot.Reviews.length).toFixed(1)} ★ &middot; ({spot.Reviews.length} {spot.Reviews.length === 1 ? 'Review' : 'Reviews'})
                    </p>
                  ) : (<p className="spot-rating">New</p>)}
                  <div className="spot-actions">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdate(spot.id); }} className="update-button">Update</button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(spot); }} className="delete-button">Delete</button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ManageSpots;
