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
      const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      navigate(`/spots/${data.spot.id}`);
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
