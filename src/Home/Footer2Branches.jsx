import React from 'react';
import { FaCaretRight } from 'react-icons/fa';

const branches = [
  {
    name: 'Vijayawada',
    address:
      '40-5-19/16, Prasad Naidu Complex, P.B.Siddhartha Busstop, Moghalrajpuram, Vijayawada, Andhra Pradesh, 520010.',
  },
  {
    name: 'Hyderabad: JNTUH',
    address:
      'Kothwal Madhava Reddy Plaza, Beside Indian Oil Petrol Bunk, JNTUH Metro Station, Nizampet X Roads, Hyderabad, 500072.',
  },
  {
    name: 'Hyderabad: Ameerpet',
    address:
      'First Floor, 101, PANCOM Business Center, opp. to Chennai Shopping Mall, Nagarjuna Nagar colony, Ameerpet, Hyderabad, Telangana 500073.',
  },
  {
    name: 'Bengaluru',
    address: '#951, 16th Main, BTM 2nd Stage, Bengaluru, Karnataka - 560076.',
  },
];

const Branches = () => {
  return (
    <div className="relative mt-9 p-2 w-full border border-[#FDFA01] text-white">
      <div
        className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FDFA01] px-6 py-2 text-black font-bold text-center rounded
        max-[375px]:w-[196px] max-[375px]:h-[46px] max-[375px]:flex max-[375px]:items-center max-[375px]:justify-center"
      >
        OUR BRANCHES
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 pt-10">
        {branches.map((branch, index) => (
          <div
            key={index}
            className="flex flex-col items-start max-[375px]:items-center p-4  text-left max-[375px]:text-center"
          >
            <div className="flex items-center gap-2 font-semibold text-[#FDFA01] max-[375px]:text-[20px]">
              <FaCaretRight className="w-[10px] h-[14px]  lg:h-[24px] lg:w-[30px] " />
              <span className="lg:text-[22px] ">{branch.name}</span>
            </div>
            <div className="text-sm mt-2 max-[375px]:text-[16px] lg:text-[18px] leading-7 text-center">
              {branch.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branches;
