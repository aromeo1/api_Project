import './ConfirmDeleteModal.css';

function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="confirm-delete-modal">
      <h2>Confirm Delete</h2>
      <p>Are you sure you want to remove this spot?</p>
      <div className="modal-buttons">
        <button className="delete-button" onClick={onConfirm}>Yes (Delete Spot)</button>
        <button className="cancel-button" onClick={onCancel}>No (Keep Spot)</button>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
