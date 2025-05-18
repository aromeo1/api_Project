import { useState } from 'react';
import './CreateSpotForm.css';

function CreateSpotForm({ onClose }) {
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [imageUrls, setImageUrls] = useState(['', '', '', '']);
  const [errors, setErrors] = useState([]);

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = [];
    if (!country) validationErrors.push('Country is required');
    if (!address) validationErrors.push('Street Address is required');
    if (!city) validationErrors.push('City is required');
    if (!state) validationErrors.push('State is required');
    if (!description || description.length < 30) validationErrors.push('Description must be at least 30 characters');
    if (!name) validationErrors.push('Name is required');
    if (!price || isNaN(price) || Number(price) <= 0) validationErrors.push('Price must be a positive number');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newSpot = {
      country,
      address,
      city,
      state,
      description,
      name,
      price: Number(price),
    };

    try {
      const response = await fetch('/api/spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpot),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors([data.message || 'Failed to create spot']);
        return;
      }

      const spotData = await response.json();

      // Upload images
      const imagesToUpload = [previewImage, ...imageUrls].filter(url => url.trim() !== '');
      for (let i = 0; i < imagesToUpload.length; i++) {
        const imgUrl = imagesToUpload[i];
        await fetch(`/api/spots/${spotData.spot.id}/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: imgUrl,
            preview: i === 0,
          }),
        });
      }

      if (onClose) onClose();

    } catch (error) {
      setErrors(['An unexpected error occurred']);
    }
  };

  return (
    <div className="spot-details-container">
      <form className="create-spot-form" onSubmit={handleSubmit}>
        <h2>Create a new Spot</h2>

        {errors.length > 0 && (
          <ul className="form-errors">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        )}

        <h3>Where&apos;s your place located?</h3>
        <p>Guests will only get your exact address once they booked a reservation.</p>

        <label>
          Country
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </label>

        <label>
          Street Address
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>

        <div className="city-state-row">
          <label>
            City
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </label>

          <label>
            State
            <input
              type="text"
              placeholder="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </label>
        </div>

        <h3>Describe your place to guests</h3>
        <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>

        <label>
          <textarea
            placeholder="Please write at least 30 characters"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <h3>Create a title for your spot</h3>
        <p>Catch guests&apos; attention with a spot title that highlights what makes your place special.</p>

        <label>
          <input
            type="text"
            placeholder="Name of your spot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <h3>Set a base price for your spot</h3>
        <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>

        <label>
          $
          <input
            type="number"
            min="1"
            placeholder="Price per night (USD)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>

        <h3>Liven up your spot with photos</h3>
        <p>Submit a link to at least one photo to publish your spot.</p>

        <label>
          Preview Image URL
          <input
            type="text"
            placeholder="Preview Image URL"
            value={previewImage}
            onChange={(e) => setPreviewImage(e.target.value)}
            required
          />
        </label>

        {imageUrls.map((url, idx) => (
          <label key={idx}>
            Image URL
            <input
              type="text"
              placeholder="Image URL"
              value={url}
              onChange={(e) => handleImageUrlChange(idx, e.target.value)}
            />
          </label>
        ))}

        <button type="submit" className="create-spot-submit-button">Create Spot</button>
      </form>
    </div>
  );
}

export default CreateSpotForm;
