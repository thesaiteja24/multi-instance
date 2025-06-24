import React from 'react';
// import errorGif from './images/error.gif';

export default function NotFound() {
  return (
    <div
      style={styles.container}
      className="flex flex-col justify-center items-center"
    >
      <img
        src="https://res.cloudinary.com/db2bpf0xw/image/upload/v1734867148/error_nlqtwy.gif"
        alt="Error"
        style={styles.errorImage}
      />
      <p style={styles.message}>
        You are not authorized to access these. Login first
      </p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    minHeight: '70vh',
  },
  errorImage: {
    width: '200px', // Adjust the width of the image as needed
    marginBottom: '20px',
  },
  message: {
    fontSize: '18px',
    marginBottom: '20px',
    color: 'black',
  },
  link: {
    fontSize: '2rem',
    fontWeight: 'bold', // Reduced font size for the link
    color: '#007bff',
    textDecoration: 'none',
  },
};
