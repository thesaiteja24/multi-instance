import { useEffect, useState } from 'react';

export function useCollegeConfig() {
  const [config, setConfig] = useState(null);
  const collegeCode = import.meta.env.VITE_COLLEGE_CODE?.toLowerCase();

  useEffect(() => {
    fetch('/college-config.json')
      .then(res => res.json())
      .then(data => {
        if (data[collegeCode]) {
          setConfig(data[collegeCode]);
        } else {
          console.warn(`No config found for college: ${collegeCode}`);
        }
      })
      .catch(err => console.error('Error loading college config:', err));
  }, [collegeCode]);

  useEffect(() => {
  if (config) {
    console.log('Loaded config:', config);
  }
}, [config]);


  return config;
}
