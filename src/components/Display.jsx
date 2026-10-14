import React from "react";

const Display = ({ score, highScore, time }) => {
  return (
    <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-4 text-xs text-gray-300 sm:px-10 sm:pb-6 sm:pt-10 sm:text-base">
      <div className="rounded-md border border-[#4B5563] px-2 py-1">
        high score : {highScore}
      </div>
      <div className="rounded-md border border-[#4B5563] px-2 py-1">
        score : {score}
      </div>
      <div className="rounded-md border border-[#4B5563] px-2 py-1">
        time : {time}s
      </div>
    </div>
  );
};

export default Display;