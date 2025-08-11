import React from "react";
import { WELCOME_MESSAGE } from "@/lib/constants";
import { MoonStar, Sparkles } from "lucide-react";

export function WelcomeMessage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Islamic Pattern Background */}
        <div className="relative">
          <div className="absolute inset-0 opacity-5">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <pattern
                  id="islamic-pattern"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                  <path
                    d="M20,10 L30,20 L20,30 L10,20 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-islamic-green-500 to-islamic-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <MoonStar className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-islamic-gold-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-islamic-green-800 mb-2">
                Islamic Finance AI
              </h1>
              <p className="text-islamic-green-600 text-lg mb-6">
                Your Expert Sharia-Compliant Financial Consultant
              </p>

              {/* Welcome Message */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-islamic-green-100">
                <div className="prose prose-islamic-green max-w-none text-left">
                  {WELCOME_MESSAGE.split("\n").map((line, index) => {
                    if (line.startsWith("•")) {
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2 mb-2"
                        >
                          <div className="w-2 h-2 bg-islamic-green-500 rounded-full mt-2 shrink-0" />
                          <span className="text-islamic-green-700">
                            {line.substring(1).trim()}
                          </span>
                        </div>
                      );
                    } else if (line.startsWith("#")) {
                      return (
                        <h3
                          key={index}
                          className="text-lg font-semibold text-islamic-green-800 mt-4 mb-2"
                        >
                          {line.substring(1).trim()}
                        </h3>
                      );
                    } else if (line.trim()) {
                      return (
                        <p key={index} className="text-islamic-green-700 mb-2">
                          {line}
                        </p>
                      );
                    }
                    return (
                      <div
                        key={index}
                        className="h-2"
                        aria-hidden="true"
                        style={{ lineHeight: "1", margin: 0, padding: 0 }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Features Grid */}
              {/* <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-islamic-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-sm font-medium text-islamic-green-800">
                    Quranic Guidance
                  </div>
                  <div className="text-xs text-islamic-green-600">
                    Based on authentic sources
                  </div>
                </div>
                <div className="bg-islamic-teal-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🏦</div>
                  <div className="text-sm font-medium text-islamic-teal-800">
                    Banking Solutions
                  </div>
                  <div className="text-xs text-islamic-teal-600">
                    Sharia-compliant products
                  </div>
                </div>
                <div className="bg-islamic-gold-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm font-medium text-islamic-gold-800">
                    Investment Advice
                  </div>
                  <div className="text-xs text-islamic-gold-600">
                    Halal investment options
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <div className="text-sm font-medium text-purple-800">
                    Contract Guidance
                  </div>
                  <div className="text-xs text-purple-600">
                    Islamic contract types
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
