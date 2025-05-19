import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSpotForm from '../CreateSpotForm/CreateSpotForm';
import { csrfFetch } from '../../store/csrf';

function CreateSpotPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  const handleCreateSpot = async (formData) => {
    setErrors([]);
    try {
      // Extract image URLs from formData
      const { previewImage, imageUrls, ...spotData } = formData;

      // Create the spot first
      const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spotData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(Object.values(errorData.errors));
        } else if (errorData.message) {
          setErrors([errorData.message]);
        } else {
          setErrors(['Failed to create spot']);
        }
        return;
      }

      const data = await response.json();
      const spotId = data.spot.id;

      // Upload preview image
      if (previewImage) {
        const previewResponse = await csrfFetch(`/api/spots/${spotId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: previewImage,
            preview: true,
          }),
        });
        if (!previewResponse.ok) {
          setErrors(prev => [...prev, 'Failed to upload preview image']);
        }
      }

      // Upload other images
      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls) {
          if (url && url.trim() !== '') {
            const imageResponse = await csrfFetch(`/api/spots/${spotId}/images`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: url.trim(),
                preview: false,
              }),
            });
            if (!imageResponse.ok) {
              setErrors(prev => [...prev, `Failed to upload image: ${url}`]);
            }
          }
        }
      }

      // After all images uploaded, navigate to spot details page
      navigate(`/spots/${spotId}`);
    } catch (error) {
      setErrors([error.message || 'Failed to create spot']);
    }
  };

  return (
    <CreateSpotForm
      onSubmit={handleCreateSpot}
      errors={errors}
      setErrors={setErrors}
    />
  );
}

export default CreateSpotPage;
