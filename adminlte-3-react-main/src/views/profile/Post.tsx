import Image from "@app/components/Image";
import Link from "next/link";
import { Share2, ThumbsUp, MessageCircle, Send, X, Clock } from "lucide-react";

const Post = ({ isClearfix = false }: { isClearfix?: boolean }) => {
  return (
    <div
      className={`p-5 mb-6 rounded-2xl border border-gray-100 bg-white transition-all hover:border-[#00563B]/20 shadow-xs hover:shadow-md ${isClearfix ? "overflow-hidden" : ""}`}
    >
      {/* User Block */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="relative p-0.5 rounded-full border border-gray-100 shadow-sm">
            <Image
              src="/img/default-profile.png"
              alt="User"
              width={40}
              height={40}
              rounded
              className="bg-gray-50"
            />
          </div>
          <div className="ml-3">
            <Link
              href="/"
              className="block text-sm font-bold text-gray-900 hover:text-[#00563B] transition-colors"
            >
              Jonathan Burke Jr.
            </Link>
            <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Clock className="w-3 h-3 mr-1" /> Posted publicly - 7:30 PM today
            </div>
          </div>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Post Content */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        System updates for the regional block management have been completed.
        Please ensure all dispatch register entries are cross-verified with the
        physical logs for this month. Thank you for your cooperation!
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mb-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
          </Link>
          <Link
            href="/"
            className="flex items-center text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5 mr-1.5" /> Like
          </Link>
        </div>
        <Link
          href="/"
          className="flex items-center text-xs font-bold text-gray-500 hover:text-[#00563B] transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Comments (5)
        </Link>
      </div>

      {/* Response Form */}
      <form className="relative mt-2">
        <input
          className="w-full h-10 pl-4 pr-12 rounded-xl bg-gray-50 border-gray-100 text-sm focus:bg-white focus:ring-[#00563B]/20 focus:border-[#00563B] transition-all"
          placeholder="Write a response..."
        />
        <button
          type="submit"
          className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-lg bg-[#00563B] text-white hover:bg-[#2e7875] shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default Post;
