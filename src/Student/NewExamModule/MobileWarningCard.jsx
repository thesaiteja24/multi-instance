import { FaMobileAlt } from 'react-icons/fa';

const MobileWarningCard = () => {
  return (
    <div className="lg:hidden w-full min-h-[80vh] flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-[0px_4px_20px_#B3BAF7] rounded-lg p-6 max-w-[600px] text-center">
        <FaMobileAlt className="text-[#19216F] text-5xl mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#19216F] font-['Inter'] mb-2">
          Desktop Required
        </h2>
        <p className="text-gray-600 text-[16px] font-['Inter']">
          This feature is only available on a PC or laptop. Please switch to a
          larger screen to continue.
        </p>
      </div>
    </div>
  );
};

export default MobileWarningCard;
