import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoonStar, BookOpen, Shield, Zap } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-islamic-green-800">
            <div className="w-8 h-8 bg-gradient-to-br from-islamic-green-500 to-islamic-teal-500 rounded-lg flex items-center justify-center">
              <MoonStar className="w-5 h-5 text-white" />
            </div>
            Welcome to Islamic Finance AI
          </DialogTitle>
          <DialogDescription className="text-base text-islamic-green-600 mt-4">
            Your intelligent companion for navigating the world of Islamic
            finance with confidence and clarity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Features */}
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-islamic-green-50 border border-islamic-green-200">
              <div className="w-10 h-10 bg-islamic-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-islamic-green-800 mb-2">
                  Comprehensive Knowledge Base
                </h3>
                <p className="text-sm text-islamic-green-600">
                  Access detailed information about Islamic banking, investment
                  principles, Qard Hasan, Mudaraba, Musharaka, Sukuk, and other
                  Sharia-compliant financial instruments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-islamic-teal-50 border border-islamic-teal-200">
              <div className="w-10 h-10 bg-islamic-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-islamic-teal-800 mb-2">
                  Sharia-Compliant Guidance
                </h3>
                <p className="text-sm text-islamic-teal-600">
                  Get reliable advice that adheres to Islamic principles, with
                  references to Quranic verses, Hadith, and scholarly consensus
                  when applicable.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-islamic-gold-50 border border-islamic-gold-200">
              <div className="w-10 h-10 bg-islamic-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-islamic-gold-800 mb-2">
                  AI-Powered Insights
                </h3>
                <p className="text-sm text-islamic-gold-600">
                  Leverage advanced AI to get personalized recommendations, risk
                  assessments, and strategic financial planning aligned with
                  Islamic values.
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Getting Started
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-islamic-green-500 rounded-full mt-2 flex-shrink-0"></span>
                Ask questions about Islamic finance concepts, products, or
                principles
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-islamic-green-500 rounded-full mt-2 flex-shrink-0"></span>
                Request guidance on Sharia-compliant investment options
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-islamic-green-500 rounded-full mt-2 flex-shrink-0"></span>
                Explore topics like Halal investing, Islamic banking, and
                ethical finance
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-islamic-green-500 rounded-full mt-2 flex-shrink-0"></span>
                Get explanations with proper Islamic references and citations
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This AI assistant provides educational
              information and guidance based on Islamic finance principles. For
              specific financial decisions or religious rulings, please consult
              qualified Islamic scholars or certified financial advisors.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-islamic-green-600 hover:bg-islamic-green-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
