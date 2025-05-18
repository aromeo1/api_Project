import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { csrfFetch } from '../../store/csrf';
import CreateSpotForm from '../CreateSpotForm/CreateSpotForm';

function UpdateSpotForm() {
  const { spotId } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchSpot() {
      try {
        const response = await fetch(`/api/spots/${spotId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch spot data');
        }
        const data = await response.json();
        const spot = data;


        const previewImage = spot.previewImage || '';
        const otherImages = spot.SpotImages ? spot.SpotImages.filter(img => !img.preview).map(img => img.url) : [];

        while (otherImages.length < 4) otherImages.push('');

        setInitialData({
          country: spot.country || '',
          address: spot.address || '',
          city: spot.city || '',
          state: spot.state || '',
          lat: spot.lat || '',
          lng: spot.lng || '',
          description: spot.description || '',
          name: spot.name || '',
          price: spot.price || '',
          previewImage,
          imageUrls: otherImages.slice(0, 4),
        });
      } catch (error) {
        console.error(error);
        setErrors({ fetch: 'Failed to load spot data' });
      } finally {
        setLoading(false);
      }
    }

    fetchSpot();
  }, [spotId]);

  const handleUpdateSubmit = async (formData) => {
    setErrors({});


    const isValidUrl = (url) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'data:') return false;
        return true;
      } catch {
        return false;
      }
    };

    const imagesToUpload = [formData.previewImage, ...formData.imageUrls].filter(url => url.trim() !== '');

    const invalidUrls = imagesToUpload.filter(url => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      setErrors({ imageUrls: 'One or more image URLs are invalid or not supported. Please provide valid URLs.' });
      return;
    }

    try {
      // Update spot details
      const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.country,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          lat: Number(formData.lat),
          lng: Number(formData.lng),
          description: formData.description,
          name: formData.name,
          price: Number(formData.price),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ submit: data.message || 'Failed to update spot' });
        }
        return;
      }

      await csrfFetch(`/api/spots/${spotId}/images`, {
        method: 'DELETE',
      });

      for (let i = 0; i < imagesToUpload.length; i++) {
        const imgUrl = imagesToUpload[i];
        await csrfFetch(`/api/spots/${spotId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imgUrl,
            preview: i === 0,
          }),
        });
      }

      navigate('/manage-spots');
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    }
  };

  if (loading) {
    return <div>Loading spot data...</div>;
  }

  if (errors.fetch) {
    return <div className="error">{errors.fetch}</div>;
  }

  return (
    <CreateSpotForm
      onClose={() => navigate('/manage-spots')}
      initialData={initialData}
      onSubmit={handleUpdateSubmit}
      formTitle="Update your Spot"
      submitButtonText="Update your Spot"
      imageUrlsOptional={true}
      errors={errors}
      setErrors={setErrors}
    />
  );
}

export default UpdateSpotForm;
