import { useState } from 'react';
import { useSelector } from 'react-redux';
import './ReviewModal.css';

function ReviewModal({ spot, onClose }) {
  const sessionUser = useSelector(state => state.session.user);
  const [reviews] = useState(spot.Reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [newReview, setNewReview] = useState('');
  const [newStars, setNewStars] = useState(5);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const userHasReviewed = sessionUser && reviews.some(review => review.User && review.User.id === sessionUser.id);
  const isOwner = sessionUser && spot.Owner && sessionUser.id === spot.Owner.id;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!newReview.trim()) {
      setFormError('Review text cannot be empty.');
      return;
    }
    if (newStars < 1 || newStars > 5) {
      setFormError('Stars must be between 1 and 5.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review: newReview,
          stars: newStars,
          spotId: spot.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.message || 'Failed to post review.');
        setSubmitting(false);
        return;
      }
      await response.json();
      setNewReview('');
      setNewStars(5);
      setFormError(null);
      setShowReviewForm(false);
      if (onClose) onClose();
    } catch (error) {
      setFormError('An error occurred while posting the review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-modal">
      <button className="close-button" onClick={onClose}>X</button>
      <h2>
        <span className="star">★</span> {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1) : 'New'} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
      </h2>
      {!isOwner && sessionUser && !userHasReviewed && !showReviewForm && (
        <button className="post-review-button" onClick={() => setShowReviewForm(true)}>Post Your Review</button>
      )}
      {showReviewForm && (
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3>Post Your Review</h3>
          {formError && <p className="form-error">{formError}</p>}
          <label>
            Review:
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows="4"
              required
            />
          </label>
          <label>
            Stars:
            <select value={newStars} onChange={(e) => setNewStars(Number(e.target.value))}>
              {[5,4,3,2,1].map((star) => (
                <option key={star} value={star}>{star}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="review">
            <p className="reviewer-name">{review.User ? review.User.firstName : 'Anonymous'}</p>
            <p className="review-date">{new Date(review.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            <p className="review-text">{review.review}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewModal;
