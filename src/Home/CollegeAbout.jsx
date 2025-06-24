import { useCollegeConfig } from '../hooks/useCollegeConfig';

const CollegeAbout = () => {
  const config = useCollegeConfig();

  if (!config) {
    // You can replace this with a spinner or skeleton loader if desired
    return (
      <div className="p-6 text-center text-gray-600">
        Loading college information...
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 md:p-12 grid grid-cols-1 md:grid-cols-[30%_60%] gap-2 items-center">
      <div className="flex justify-center">
        <img
          src={import.meta.env.VITE_COLLEGE_LOGO}
          alt="College Logo"
          className="w-full max-w-xs object-contain"
        />
      </div>

      <div className="text-gray-800 text-justify">
        <h2 className="text-sm md:text-2xl mb-4">
          <span className="text-black font-semibold">{config.name}</span>{' '}
          {config.about}
        </h2>
      </div>
    </div>
  );
};

export default CollegeAbout;
