import { useState, useEffect } from 'react';
import { csrfFetch } from '../../store/csrf';
import './ReviewModal.css';

function ReviewFormModal({ spot, onClose }) {
  // const sessionUser = useSelector(state => state.session.user);

  const [newReview, setNewReview] = useState('');
  const [newStars, setNewStars] = useState(5);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNewReview('');
    setNewStars(5);
    setFormError(null);
    setSubmitting(false);
  }, []);

  const isSubmitDisabled = newReview.trim().length < 10 || newStars < 1 || newStars > 5 || submitting;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (newReview.trim().length < 10) {
      setFormError('Review text must be at least 10 characters.');
      return;
    }
    if (newStars < 1 || newStars > 5) {
      setFormError('Stars must be between 1 and 5.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await csrfFetch('/api/reviews', {
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
      setNewReview('');
      setNewStars(5);
      setFormError(null);
      if (onClose) onClose();
    } catch (error) {
      setFormError('An error occurred while posting the review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-modal">
      {/* <button className="close-button" onClick={onClose}>X</button> */}
      <form className="review-form" onSubmit={handleReviewSubmit}>
        <h3 className="review-form-title">How was your stay?</h3>
        {formError && <p className="form-error">{formError}</p>}
        <label>
          Review:
          <textarea
            placeholder="Leave your review here..."
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
        <button type="submit" disabled={isSubmitDisabled}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default ReviewFormModal;
