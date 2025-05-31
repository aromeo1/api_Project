import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import ReviewFormModal from '../ReviewModal/ReviewFormModal';
import './SpotDetails.css';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionUser = useSelector(state => state.session.user);

  useEffect(() => {
    async function fetchSpotDetails() {
      try {
        const response = await fetch(`/api/spots/${spotId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch spot details');
        }
        const data = await response.json();
        setSpot(data);
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
  const otherImages = spot.SpotImages ? spot.SpotImages.filter(img => img.url !== mainImage).slice(0, 4) : [];

  const reviews = spot.Reviews || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length).toFixed(1) : null;

  const isOwner = sessionUser && spot.Owner && sessionUser.id === spot.Owner.id;
  const noReviews = reviews.length === 0;
  const showFirstReviewMessage = sessionUser && !isOwner && noReviews;

  return (
    <div className="spot-details-container">
      <div className="spot-header">
        <h1>{spot.name}</h1>
        <p>{spot.city}, {spot.state}, {spot.country}</p>
      </div>
      <div className="spot-content">
        <div className="spot-images-section">
          <div className="main-image-container">
            {mainImage && <img src={mainImage} alt={spot.name} className="main-image" />}
          </div>
          <div className="other-images-grid">
            {otherImages.map((img, idx) => (
              <img key={idx} src={img.url} alt={`${spot.name} image ${idx + 1}`} className="other-image" />
            ))}
          </div>
          <div className="host-info-description">
            <h3>Hosted by {spot.Owner ? `${spot.Owner.firstName} ${spot.Owner.lastName}` : 'Unknown'}</h3>
            <p>{spot.description}</p>
          </div>
        </div>
        <div className="spot-reserve-box">
          <p className="spot-price">${spot.price} night</p>
          <div className="spot-rating-reserve">
            {averageRating ? (
              <p>
                <span className="star">★</span> {averageRating} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            ) : (
              <p>New</p>
            )}
            <button className="reserve-button" onClick={() => alert('<Feature Coming Soon>')}>Reserve</button>
          </div>
        </div>
      </div>
      <hr />
      <div className="reviews-section">
        <h2>
          <span className="star">★</span> {averageRating ? averageRating : 'New'} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </h2>
        {showFirstReviewMessage ? (
          <p>Be the first to post a review!</p>
        ) : (
          noReviews ? <p>No reviews yet.</p> : reviews.map((review) => (
            <div key={review.id} className="review">
              <p className="reviewer-name">{review.User ? review.User.firstName : 'Anonymous'}</p>
              <p className="review-date">{new Date(review.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
              <p className="review-text">{review.review}</p>
            </div>
          ))
        )}
        {sessionUser && !isOwner && (
          <OpenModalButton
            buttonText="Post Your Review"
            modalComponent={<ReviewFormModal spot={spot} />}
          />
        )}
      </div>
    </div>
  );
}

export default SpotDetails;
