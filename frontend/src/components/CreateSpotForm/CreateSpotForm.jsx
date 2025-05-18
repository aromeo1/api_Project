import { useState, useEffect } from 'react';
import './CreateSpotForm.css';

function CreateSpotForm({
  onClose,
  initialData = {},
  onSubmit,
  formTitle = 'Create a new Spot',
  submitButtonText = 'Create Spot',
  imageUrlsOptional = false,
  errors: externalErrors = [],
  setErrors: setExternalErrors,
  showOptionalFields = true,
}) {
  const [country, setCountry] = useState(initialData.country || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [city, setCity] = useState(initialData.city || '');
  const [state, setState] = useState(initialData.state || '');
  const [lat, setLat] = useState(initialData.lat || '');
  const [lng, setLng] = useState(initialData.lng || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [name, setName] = useState(initialData.name || '');
  const [price, setPrice] = useState(initialData.price || '');
  const [previewImage, setPreviewImage] = useState(initialData.previewImage || '');
  const [imageUrls, setImageUrls] = useState(initialData.imageUrls || ['', '', '', '']);
  const [localErrors, setLocalErrors] = useState([]);

  useEffect(() => {
    setCountry(initialData.country || '');
    setAddress(initialData.address || '');
    setCity(initialData.city || '');
    setState(initialData.state || '');
    setLat(initialData.lat || '');
    setLng(initialData.lng || '');
    setDescription(initialData.description || '');
    setName(initialData.name || '');
    setPrice(initialData.price || '');
    setPreviewImage(initialData.previewImage || '');
    setImageUrls(initialData.imageUrls || ['', '', '', '']);
  }, [initialData]);

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErrors([]);
    if (setExternalErrors) setExternalErrors([]);

    const validationErrors = [];
    if (!country) validationErrors.push('Country is required');
    if (!address) validationErrors.push('Street Address is required');
    if (!city) validationErrors.push('City is required');
    if (!state) validationErrors.push('State is required');
    if (!description || description.length < 30) validationErrors.push('Description must be at least 30 characters');
    if (!name) validationErrors.push('Name is required');
    if (!price || isNaN(price) || Number(price) <= 0) validationErrors.push('Price must be a positive number');

    if (!previewImage) validationErrors.push('Preview Image URL is required');

    if (validationErrors.length > 0) {
      setLocalErrors(validationErrors);
      if (setExternalErrors) setExternalErrors(validationErrors);
      return;
    }

    const formData = {
      country,
      address,
      city,
      state,
      description,
      name,
      price: Number(price),
      previewImage,
      imageUrls: imageUrlsOptional ? imageUrls : [],
    };

    if (showOptionalFields) {
      formData.lat = lat ? Number(lat) : null;
      formData.lng = lng ? Number(lng) : null;
    }

    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  return (
    <div className="spot-details-container">
      <form className="create-spot-form" onSubmit={handleSubmit}>
        <h2>{formTitle}</h2>

        {(localErrors.length > 0 || externalErrors.length > 0) && (
          <ul className="form-errors">
            {localErrors.map((error, idx) => (
              <li key={`local-${idx}`}>{error}</li>
            ))}
            {externalErrors.map((error, idx) => (
              <li key={`external-${idx}`}>{error}</li>
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

        {showOptionalFields && (
          <div className="lat-lng-row">
            <label>
              Latitude
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </label>

            <label>
              Longitude
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </label>
          </div>
        )}

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

        {imageUrlsOptional
          ? imageUrls.map((url, idx) => (
              <label key={idx}>
                Image URL
                <input
                  type="text"
                  placeholder="Image URL"
                  value={url}
                  onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                />
              </label>
            ))
          : null}

        <button type="submit" className="create-spot-submit-button">{submitButtonText}</button>
      </form>
    </div>
  );
}

export default CreateSpotForm;
