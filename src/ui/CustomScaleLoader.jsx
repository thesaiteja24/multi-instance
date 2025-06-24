// ui/ScaleLoader.js
import { ScaleLoader } from 'react-spinners';

const CustomScaleLoader = () => {
  return (
    <div className="flex justify-center items-center min-w-full min-h-full">
      <ScaleLoader
        color="#00007f" // Customize the color
        height={35} // Customize the height
        width={4} // Customize the width
        radius={2} // Customize the radius
        margin={2} // Customize the margin between bars
        loading={true} // Always loading when used as fallback
      />
    </div>
  );
};

export default CustomScaleLoader;
