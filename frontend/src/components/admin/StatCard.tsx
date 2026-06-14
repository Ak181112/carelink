import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">

      <div className="flex items-center justify-between">

        <p className="text-slate-600 font-medium">
          {title}
        </p>

        <Icon
          size={22}
          className="text-[#003898]"
        />

      </div>

      <h3 className="text-3xl font-bold mt-3 text-slate-900">
        {value}
      </h3>

      <p className="text-green-600 text-sm mt-2">
        +12% from last month
      </p>

    </div>
  );
}