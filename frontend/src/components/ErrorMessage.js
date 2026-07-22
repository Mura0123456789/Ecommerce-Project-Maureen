export default function ErrorMessage({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#b00020', background: '#fdecea', borderRadius: 8 }}>
      {message}
    </div>
  );
}
