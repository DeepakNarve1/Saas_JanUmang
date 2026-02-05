import Image from "@app/components/Image";
import Link from "next/link";
import { Mail, User, MessageSquare, Camera, Clock, Circle } from "lucide-react";

const TimelineTab = ({ isActive }: { isActive: boolean }) => {
  return (
    <div
      className={`animate-in fade-in duration-500 ${isActive ? "block" : "hidden"}`}
    >
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
        {/* Date Label */}
        <div className="relative flex items-center justify-start">
          <span className="px-3 py-1 bg-[#00563B] text-white text-[10px] font-bold uppercase rounded shadow-sm relative z-10">
            Current Month
          </span>
        </div>

        {/* Item 1 */}
        <div className="relative pl-12 group">
          <div className="absolute left-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
            <Mail className="w-5 h-5" />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs group-hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">
                <Link href="/" className="text-[#00563B] hover:underline">
                  System Administration
                </Link>{" "}
                sent you a notification
              </h3>
              <span className="text-[10px] text-gray-400 flex items-center font-medium">
                <Clock className="w-3 h-3 mr-1" /> 12:05 PM
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your profile has been successfully integrated with the regional
              block database for Barwani.
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="relative pl-12 group">
          <div className="absolute left-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
            <User className="w-5 h-5" />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs group-hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-800 border-none">
                <Link href="/" className="text-[#00563B] hover:underline">
                  Support Team
                </Link>{" "}
                verified your credentials
              </h3>
              <span className="text-[10px] text-gray-400 flex items-center font-medium">
                <Clock className="w-3 h-3 mr-1" /> 5 mins ago
              </span>
            </div>
          </div>
        </div>

        {/* Item 3 */}
        <div className="relative pl-12 group">
          <div className="absolute left-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs group-hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">
                <Link href="/" className="text-[#00563B] hover:underline">
                  Project Manager
                </Link>{" "}
                tagged you in a report
              </h3>
              <span className="text-[10px] text-gray-400 flex items-center font-medium">
                <Clock className="w-3 h-3 mr-1" /> 27 mins ago
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Please review the newly updated dispatch register entries for the
              central block.
            </p>
          </div>
        </div>

        {/* Date Label */}
        <div className="relative flex items-center justify-start mt-8">
          <span className="px-3 py-1 bg-gray-400 text-white text-[10px] font-bold uppercase rounded shadow-sm relative z-10">
            Last Month
          </span>
        </div>

        {/* Item 4 */}
        <div className="relative pl-12 group">
          <div className="absolute left-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs group-hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">
                <Link href="/" className="text-[#00563B] hover:underline">
                  Media Team
                </Link>{" "}
                uploaded field photos
              </h3>
              <span className="text-[10px] text-gray-400 flex items-center font-medium">
                <Clock className="w-3 h-3 mr-1" /> 2 days ago
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center"
                >
                  <img
                    src="/img/default-profile.png"
                    className="w-6 opacity-30"
                    alt="placeholder"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* End Label */}
        <div className="relative pl-5">
          <Circle className="w-4 h-4 text-gray-200 fill-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default TimelineTab;
