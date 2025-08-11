import { Button } from "@/components/ui/button";
import { QUICK_ACTIONS } from "@/lib/constants";
import {
  HelpingHand,
  TrendingUp,
  Users,
  Building,
  FileText,
  Shield,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  HelpingHand,
  TrendingUp,
  Users,
  Building,
  FileText,
  Shield,
};

interface QuickActionsProps {
  onActionClick: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickActions({
  onActionClick,
  disabled = false,
}: QuickActionsProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "banking":
        return "bg-islamic-green-100 text-islamic-green-700 hover:bg-islamic-green-200";
      case "investment":
        return "bg-islamic-teal-100 text-islamic-teal-700 hover:bg-islamic-teal-200";
      case "contracts":
        return "bg-islamic-gold-100 text-islamic-gold-700 hover:bg-islamic-gold-200";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-islamic-green-50 to-islamic-teal-50">
      <div className="max-w-4xl mx-auto">
        {/* <h3 className="text-lg font-semibold text-islamic-green-800 mb-4 text-center">
          Quick Actions
        </h3> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = iconMap[action.icon];

            return (
              <Button
                key={action.id}
                variant="ghost"
                disabled={disabled}
                onClick={() => onActionClick(action.prompt)}
                className={`
                  h-auto p-4 flex flex-col items-start gap-2 text-left text-wrap
                  ${getCategoryColor(action.category)}
                  transition-all duration-200 hover:scale-105 hover:shadow-md
                `}
              >
                <div className="flex items-center gap-2 w-full">
                  {Icon && <Icon className="w-5 h-5 shrink-0" />}
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <p className="text-xs opacity-80 line-clamp-2">
                  {action.description}
                </p>
              </Button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-islamic-green-600">
            Click any topic above to get started, or type your own question
            below
          </p>
        </div>
      </div>
    </div>
  );
}
