"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  Clock3,
  TriangleAlert,
  CalendarDays,
  Wallet,
  ClipboardList,
  CreditCard,
  Mail,
  UserRound,
  ShieldCheck,
  ShieldX,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  XCircle,
  UserCheck,
  FileCheck2,
  Loader2,
  Printer,
} from "lucide-react";

import { adminAPI } from "@/services/api";

/* ============================================================
   TYPES
============================================================ */

interface RoleDistribution {
  familyMembers: number;
  caretakers: number;
  admins: number;
}

interface ApplicationStats {
  pending: number;
  approved: number;
  rejected: number;
}

interface MonthlyCaretakerRevenue {
  month: string;
  caretakerName: string;
  revenue: number;
}

interface Stats {
  totalUsers: number;
  totalCaretakers: number;
  totalClients: number;

  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;

  addressMismatchCount?: number;

  totalBookings?: number;
  totalRevenue?: number;

  roleDistribution?: RoleDistribution;

  monthlyCaretakerRevenue?: MonthlyCaretakerRevenue[];
}

interface RecentApplication {
  _id: string;
  caretakerId?: {
    name?: string;
  };
  fullName?: string;
  status?: string;
  verificationStatus?: string;
  addressMatched?: boolean;
  nicNumber?: string;
  submittedAt?: string;
  createdAt?: string;
}

interface ReportApplication extends RecentApplication {
  nicAddress?: string;
  profileAddress?: string;
  address?: string;
  district?: string;
  town?: string;
  contactNumber?: string;
  experience?: string;
  qualifications?: string;
  adminNote?: string;
  reviewedAt?: string;
  updatedAt?: string;
  documents?: {
    nicDocument?: string;
    drivingLicense?: string;
    certificates?: string[];
    photo?: string;
  };
}

/* ============================================================
   HELPERS
============================================================ */

const formatCurrency = (value: number) =>
  `LKR ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getMonthShort = (month: string) => {
  if (!month) return month;

  const date = new Date(`${month}-01`);

  if (Number.isNaN(date.getTime())) {
    return month;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
  });
};

/* ============================================================
   PIE / DONUT CHART
============================================================ */

function RoleDistributionChart({
  distribution,
}: {
  distribution: RoleDistribution;
}) {
  const total =
    distribution.familyMembers + distribution.caretakers + distribution.admins;

  const familyPercentage =
    total > 0 ? (distribution.familyMembers / total) * 100 : 0;

  const caretakerPercentage =
    total > 0 ? (distribution.caretakers / total) * 100 : 0;

  const adminPercentage = total > 0 ? (distribution.admins / total) * 100 : 0;

  const familyEnd = familyPercentage;

  const caretakerEnd = familyEnd + caretakerPercentage;

  const gradient =
    total > 0
      ? `conic-gradient(
          #3B82F6 0 ${familyEnd}%,
          #10B981 ${familyEnd}% ${caretakerEnd}%,
          #8B5CF6 ${caretakerEnd}% ${caretakerEnd + adminPercentage}%,
          #E2E8F0 ${caretakerEnd + adminPercentage}% 100%
        )`
      : `conic-gradient(#E2E8F0 0 100%)`;

  const items = [
    {
      label: "Family Members",
      value: distribution.familyMembers,
      color: "bg-blue-500",
      percentage: total > 0 ? (distribution.familyMembers / total) * 100 : 0,
    },
    {
      label: "Caretakers",
      value: distribution.caretakers,
      color: "bg-emerald-500",
      percentage: total > 0 ? (distribution.caretakers / total) * 100 : 0,
    },
    {
      label: "Administrators",
      value: distribution.admins,
      color: "bg-violet-500",
      percentage: total > 0 ? (distribution.admins / total) * 100 : 0,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
      {/* Donut */}
      <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: gradient }}
        />

        <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
          <span className="text-3xl font-bold text-slate-900 dark:text-yellow-200">
            {total}
          </span>

          <span className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Registered Users
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-4 sm:max-w-xs">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${item.color}`}
                />

                <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.label}
                </span>
              </div>

              <span className="text-sm font-bold text-slate-900 dark:text-yellow-200">
                {item.value}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Percentage
              </span>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MONTHLY CARETAKER REVENUE BAR CHART
============================================================ */

function MonthlyRevenueChart({ data }: { data: MonthlyCaretakerRevenue[] }) {
  const [selectedCaretaker, setSelectedCaretaker] = useState("All Caretakers");

  const caretakerNames = useMemo(() => {
    return Array.from(
      new Set(data.map((item) => item.caretakerName).filter(Boolean)),
    );
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedCaretaker === "All Caretakers") {
      return data;
    }

    return data.filter((item) => item.caretakerName === selectedCaretaker);
  }, [data, selectedCaretaker]);

  /*
   * Group revenue by month.
   *
   * For "All Caretakers", each month's bar represents
   * the combined closed/paid revenue of all caretakers.
   */
  const monthlyTotals = useMemo(() => {
    const map = new Map<string, number>();

    filteredData.forEach((item) => {
      const month = getMonthShort(item.month);

      map.set(month, (map.get(month) || 0) + Number(item.revenue || 0));
    });

    return Array.from(map.entries());
  }, [filteredData]);

  const maxValue = Math.max(...monthlyTotals.map(([, value]) => value), 1);

  return (
    <div>
      {/* Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Paid bookings only
          </p>
        </div>

        <select
          value={selectedCaretaker}
          onChange={(event) => setSelectedCaretaker(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0052CC] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option>All Caretakers</option>

          {caretakerNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {monthlyTotals.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <BarChart3 className="mb-3 h-10 w-10 text-slate-400" />

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            No completed paid revenue data available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex min-w-[680px] items-end gap-5 border-b border-l border-slate-200 px-4 pb-4 pt-8 dark:border-slate-700">
            {monthlyTotals.map(([month, value]) => {
              const height = Math.max((value / maxValue) * 220, 8);

              return (
                <div
                  key={month}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  {/* Value */}
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-yellow-200">
                    {formatCurrency(value)}
                  </span>

                  {/* Bar */}
                  <div
                    className="group relative flex w-full max-w-[54px] items-end justify-center"
                    style={{
                      height: 220,
                    }}
                  >
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#003898] via-[#0052CC] to-[#60A5FA] shadow-sm transition-all duration-300 group-hover:from-[#002D73] group-hover:via-[#0747A6] group-hover:to-[#93C5FD]"
                      style={{
                        height,
                      }}
                      title={`${month}: ${formatCurrency(value)}`}
                    />
                  </div>

                  {/* Month */}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   OCR CHART
============================================================ */

function ApplicationStatusChart({ stats }: { stats: ApplicationStats }) {
  const pending = stats.pending || 0;
  const approved = stats.approved || 0;
  const rejected = stats.rejected || 0;

  const totalApplications = pending + approved + rejected;

  const pendingPercentage =
    totalApplications > 0 ? (pending / totalApplications) * 100 : 0;

  const approvedPercentage =
    totalApplications > 0 ? (approved / totalApplications) * 100 : 0;

  const rejectedPercentage =
    totalApplications > 0 ? (rejected / totalApplications) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Pending */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Pending Applications
            </span>

            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>

          <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
            {pending}
          </p>

          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            {pendingPercentage.toFixed(1)}% of applications
          </p>
        </div>

        {/* Approved */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Approved Applications
            </span>

            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            {approved}
          </p>

          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            {approvedPercentage.toFixed(1)}% of applications
          </p>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Rejected Applications
            </span>

            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>

          <p className="text-2xl font-bold text-red-800 dark:text-red-200">
            {rejected}
          </p>

          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {rejectedPercentage.toFixed(1)}% of applications
          </p>
        </div>
      </div>

      {/* Horizontal chart */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-yellow-200">
            All Caretaker Applications
          </span>

          <span className="text-sm font-bold text-slate-900 dark:text-yellow-200">
            {totalApplications}
          </span>
        </div>

        {totalApplications > 0 ? (
          <>
            <div className="flex h-6 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="bg-amber-400 transition-all"
                style={{
                  width: `${pendingPercentage}%`,
                }}
                title={`Pending: ${pending}`}
              />

              <div
                className="bg-emerald-500 transition-all"
                style={{
                  width: `${approvedPercentage}%`,
                }}
                title={`Approved: ${approved}`}
              />

              <div
                className="bg-red-500 transition-all"
                style={{
                  width: `${rejectedPercentage}%`,
                }}
                title={`Rejected: ${rejected}`}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Pending
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Approved
              </span>

              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Rejected
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No caretaker applications available.
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);

  const [reportApplications, setReportApplications] = useState<
    ReportApplication[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [reportLoading, setReportLoading] = useState(false);

  const [reportGeneratedAt, setReportGeneratedAt] = useState("");

  const [error, setError] = useState("");

  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await adminAPI.getDashboard();

        if (!mounted) return;

        setStats(data.stats || null);

        setRecentApps(data.recentApplications || []);
      } catch (err: unknown) {
        if (!mounted) return;

        setError(
          err instanceof Error ? err.message : "Failed to load dashboard.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     GENERATE FULL PDF REPORT
  ========================================================== */

  const generatePdfReport = async () => {
    try {
      setReportLoading(true);
      setError("");

      const applicationData = await adminAPI.getApplications();

      const applications = Array.isArray(applicationData)
        ? applicationData
        : Array.isArray(applicationData?.applications)
          ? applicationData.applications
          : Array.isArray(applicationData?.data)
            ? applicationData.data
            : Array.isArray(applicationData?.data?.applications)
              ? applicationData.data.applications
              : [];

      setReportApplications(applications as ReportApplication[]);

      /*
       * Set this only when the user requests a report.
       * This prevents SSR/client hydration mismatch.
       */
      setReportGeneratedAt(new Date().toLocaleString("en-LK"));

      /*
       * Allow React to render the new applications
       * and generated timestamp before printing.
       */
      window.setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.print();
          });
        });
      }, 300);
    } catch (err: unknown) {
      console.error("PDF report generation error:", err);

      setError(
        err instanceof Error ? err.message : "Failed to generate PDF report.",
      );

      setReportLoading(false);
    }
  };

  /* ==========================================================
     RESET REPORT LOADING AFTER PRINT
  ========================================================== */

  useEffect(() => {
    const handleAfterPrint = () => {
      setReportLoading(false);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  /* ==========================================================
     FALLBACK CHART DATA
  ========================================================== */

  const roleDistribution: RoleDistribution = stats?.roleDistribution || {
    familyMembers: stats?.totalClients || 0,

    caretakers: stats?.totalCaretakers || 0,

    admins: Math.max(
      (stats?.totalUsers || 0) -
        (stats?.totalClients || 0) -
        (stats?.totalCaretakers || 0),
      0,
    ),
  };

  const applicationStats: ApplicationStats = {
    pending: stats?.pendingApplications || 0,
    approved: stats?.approvedApplications || 0,
    rejected: stats?.rejectedApplications || 0,
  };

  const totalApplicationsForReport =
    applicationStats.pending +
    applicationStats.approved +
    applicationStats.rejected;

  const monthlyRevenue = stats?.monthlyCaretakerRevenue || [];

  const reportMonthlyTotals = useMemo(() => {
    const totals = new Map<string, number>();

    monthlyRevenue.forEach((item) => {
      const current = totals.get(item.month) || 0;

      totals.set(item.month, current + Number(item.revenue || 0));
    });

    const currentYear = new Date().getFullYear();

    return Array.from({ length: 12 }, (_, index) => {
      const monthNumber = String(index + 1).padStart(2, "0");

      const monthKey = `${currentYear}-${monthNumber}`;

      const date = new Date(`${monthKey}-01`);

      return {
        key: monthKey,
        label: date.toLocaleDateString("en-US", {
          month: "short",
        }),
        amount: Number((totals.get(monthKey) || 0).toFixed(2)),
      };
    });
  }, [monthlyRevenue]);

  const reportCaretakerRevenueGroups = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const caretakerMap = new Map<string, Map<string, number>>();

    monthlyRevenue.forEach((item) => {
      const caretakerName = String(
        item.caretakerName || "Unknown Caretaker",
      ).trim();

      if (!caretakerMap.has(caretakerName)) {
        caretakerMap.set(caretakerName, new Map<string, number>());
      }

      const monthMap = caretakerMap.get(caretakerName)!;

      monthMap.set(
        item.month,
        (monthMap.get(item.month) || 0) + Number(item.revenue || 0),
      );
    });

    return Array.from(caretakerMap.entries())
      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
      .map(([caretakerName, monthMap]) => {
        const months = Array.from({ length: 12 }, (_, index) => {
          const monthNumber = String(index + 1).padStart(2, "0");

          const monthKey = `${currentYear}-${monthNumber}`;

          const date = new Date(`${monthKey}-01`);

          return {
            key: monthKey,
            label: date.toLocaleDateString("en-US", {
              month: "short",
            }),
            amount: Number((monthMap.get(monthKey) || 0).toFixed(2)),
          };
        });

        const annualTotal = months.reduce((sum, item) => sum + item.amount, 0);

        return {
          caretakerName,
          months,
          annualTotal: Number(annualTotal.toFixed(2)),
        };
      });
  }, [monthlyRevenue]);

  const reportUserTotal =
    roleDistribution.familyMembers +
    roleDistribution.caretakers +
    roleDistribution.admins;

  const reportUserPercentages = {
    family:
      reportUserTotal > 0
        ? (roleDistribution.familyMembers / reportUserTotal) * 100
        : 0,

    caretaker:
      reportUserTotal > 0
        ? (roleDistribution.caretakers / reportUserTotal) * 100
        : 0,

    admin:
      reportUserTotal > 0
        ? (roleDistribution.admins / reportUserTotal) * 100
        : 0,
  };

  const reportApplicationPercentages = {
    pending:
      totalApplicationsForReport > 0
        ? (applicationStats.pending / totalApplicationsForReport) * 100
        : 0,

    approved:
      totalApplicationsForReport > 0
        ? (applicationStats.approved / totalApplicationsForReport) * 100
        : 0,

    rejected:
      totalApplicationsForReport > 0
        ? (applicationStats.rejected / totalApplicationsForReport) * 100
        : 0,
  };

  const maxReportMonthlyRevenue = Math.max(
    ...reportMonthlyTotals.map((item) => item.amount),
    1,
  );
  /* ==========================================================
     STAT CARDS
  ========================================================== */

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      href: "/admin/users",

      description: "All registered platform users",

      iconClass:
        "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",

      trend: "Platform-wide",
    },

    {
      label: "Total Caretakers",
      value: stats?.totalCaretakers || 0,
      icon: Stethoscope,
      href: "/admin/users?role=caretaker",

      description: "All registered caretakers",

      iconClass:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",

      trend: "All registrations",
    },

    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: CalendarDays,
      href: "/admin/bookings",

      description: "Closed and paid bookings",

      iconClass:
        "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",

      trend: "Completed revenue cycle",
    },

    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: Wallet,
      href: "/admin/payments",

      description: "All revenue from closed paid bookings",

      iconClass:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",

      trend: "Gross booking revenue",
    },

    {
      label: "Pending Applications",
      value: stats?.pendingApplications || 0,
      icon: Clock3,
      href: "/admin/applications?status=pending",

      description: "Applications awaiting review",

      iconClass:
        "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300",

      trend: "Requires review",
    },

    {
      label: "Address Mismatches",
      value: stats?.addressMismatchCount || 0,
      icon: TriangleAlert,
      href: "/admin/applications",

      description: "Verification address exceptions",

      iconClass: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300",

      trend: "Needs attention",
    },
  ];

  /* ==========================================================
     STATUS BADGE
  ========================================================== */

  const statusBadge = (status?: string) => {
    const normalized = String(status || "").toLowerCase();

    const map: Record<
      string,
      {
        className: string;
        label: string;
      }
    > = {
      pending: {
        className:
          "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        label: "Pending",
      },

      approved: {
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
        label: "Approved",
      },

      rejected: {
        className:
          "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300",
        label: "Rejected",
      },
    };

    const badge = map[normalized] || {
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      label: status || "Not checked",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  /* ==========================================================
     ADDRESS BADGE
  ========================================================== */

  const addressBadge = (matched?: boolean) => {
    if (matched === true) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Address Same
        </span>
      );
    }

    if (matched === false) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-300">
          <XCircle className="h-3.5 w-3.5" />
          Address Not Same
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Clock className="h-3.5 w-3.5" />
        Not Checked
      </span>
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-8">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#003898] dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            <Activity className="h-3.5 w-3.5" />
            System Overview
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#091E42] dark:text-yellow-200">
            Admin Dashboard
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-[#42526E] dark:text-yellow-200">
            CareLink+ platform overview
          </p>
        </div>

        {/* <Link
          href="/admin/users"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#0052CC] hover:text-[#0052CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
        >
          Manage Users
          <ArrowUpRight className="h-4 w-4" />
        </Link> */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Manage Users - existing functionality */}
          <Link
            href="/admin/users"
            className="
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-white
      px-4
      py-2.5
      text-sm
      font-semibold
      text-slate-700
      shadow-sm
      transition
      hover:border-[#0052CC]
      hover:text-[#0052CC]

      dark:border-slate-700
      dark:bg-slate-900
      dark:text-slate-200
      dark:hover:border-blue-400
      dark:hover:text-blue-300
    "
          >
            Manage Users
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {/* NEW: Generate PDF Report */}
          <button
            type="button"
            onClick={generatePdfReport}
            disabled={reportLoading || loading}
            className="
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-[#003898]
      px-4
      py-2.5
      text-sm
      font-semibold
      text-white
      shadow-sm
      transition
      hover:bg-[#002D73]
      hover:shadow-md
      disabled:cursor-not-allowed
      disabled:opacity-60

      dark:bg-blue-600
      dark:hover:bg-blue-500
    "
          >
            {reportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}

            {reportLoading ? "Preparing Report..." : "Generate PDF Report"}
          </button>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">Dashboard data could not be loaded</p>

            <p className="mt-1 text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ======================================================
          KPI CARDS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.label}
              href={card.href}
              className="
                group
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-blue-200
                hover:shadow-lg
                dark:border-slate-700
                dark:bg-slate-900
                dark:hover:border-slate-600
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#0052CC] dark:text-slate-600 dark:group-hover:text-blue-400" />
              </div>

              <p className="mt-4 text-2xl font-bold tracking-tight text-[#091E42] dark:text-yellow-200">
                {loading ? "—" : card.value}
              </p>

              <p className="mt-1 text-sm font-semibold text-[#42526E] dark:text-slate-300">
                {card.label}
              </p>

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {card.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {card.trend}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ======================================================
          CHARTS ROW 1
      ======================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ----------------------------------------------------
            USER ROLE PIE
        ----------------------------------------------------- */}

        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                  <PieChart className="h-4 w-4" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  User Analytics
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#091E42] dark:text-yellow-200">
                Registered User Distribution
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                All registered family members, caretakers, and administrators.
              </p>
            </div>

            <Link
              href="/admin/users"
              className="text-sm font-semibold text-[#003898] hover:underline dark:text-blue-400"
            >
              View users
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#0052CC]" />
            </div>
          ) : (
            <RoleDistributionChart distribution={roleDistribution} />
          )}
        </section>

        {/* ----------------------------------------------------
            OCR CHART
        ----------------------------------------------------- */}

        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <FileCheck2 className="h-4 w-4" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Verification Analytics
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#091E42] dark:text-yellow-200">
                Caretaker Application Status
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Overview of pending, approved, and rejected caretaker
                applications
              </p>
            </div>

            <Link
              href="/admin/applications"
              className="text-sm font-semibold text-[#003898] hover:underline dark:text-blue-400"
            >
              View results
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#0052CC]" />
            </div>
          ) : (
            <ApplicationStatusChart stats={applicationStats} />
          )}
        </section>
      </div>

      {/* ======================================================
          MONTHLY REVENUE
      ======================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Financial Analytics
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#091E42] dark:text-yellow-200">
              Monthly Caretaker Revenue
            </h2>
          </div>

          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#003898] hover:underline dark:text-blue-400"
          >
            View payments
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#0052CC]" />
          </div>
        ) : (
          <MonthlyRevenueChart data={monthlyRevenue} />
        )}
      </section>

      {/* ======================================================
          RECENT APPLICATIONS + QUICK ACTIONS
      ======================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ====================================================
            RECENT APPLICATIONS
        ===================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                  <ClipboardList className="h-4 w-4" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Operations
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#091E42] dark:text-yellow-200">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest caretaker applications and verification activity.
              </p>
            </div>

            <Link
              href="/admin/applications"
              className="text-sm font-semibold text-[#003898] hover:underline dark:text-blue-400"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#0052CC]" />
            </div>
          ) : recentApps.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center">
              <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600" />

              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                No applications yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.slice(0, 6).map((app) => {
                const applicant =
                  app.caretakerId?.name || app.fullName || "N/A";

                const date = app.submittedAt || app.createdAt;

                return (
                  <div
                    key={app._id}
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        p-4
                        transition
                        hover:border-blue-200
                        hover:bg-slate-50
                        dark:border-slate-700
                        dark:hover:border-slate-600
                        dark:hover:bg-slate-800/60
                      "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0052CC] dark:bg-blue-950/50 dark:text-blue-300">
                          {applicant.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#091E42] dark:text-yellow-200">
                            {applicant}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {date
                              ? new Date(date).toLocaleDateString("en-LK", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {statusBadge(app.status || app.verificationStatus)}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {addressBadge(app.addressMatched)}

                      {app.nicNumber && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          NIC: {app.nicNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                <Activity className="h-4 w-4" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#091E42] dark:text-yellow-200">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Frequently used administrative operations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                label: "Review Pending Applications",
                href: "/admin/applications?status=pending",
                icon: ClipboardList,
                urgent: (stats?.pendingApplications || 0) > 0,
                description: "Review new caretaker applications",
              },

              {
                label: "Review Address Mismatches",
                href: "/admin/applications",
                icon: TriangleAlert,
                urgent: (stats?.addressMismatchCount || 0) > 0,
                description: "Check verification exceptions",
              },

              {
                label: "Manage Users",
                href: "/admin/users",
                icon: UserRound,
                urgent: false,
                description: "Accounts and access control",
              },

              {
                label: "Manage Bookings",
                href: "/admin/bookings",
                icon: CalendarDays,
                urgent: false,
                description: "Review booking operations",
              },

              {
                label: "View Payments",
                href: "/admin/payments",
                icon: CreditCard,
                urgent: false,
                description: "Completed payment transactions",
              },

              {
                label: "Contact Messages",
                href: "/admin/contact-messages",
                icon: Mail,
                urgent: false,
                description: "Customer support messages",
              },

              {
                label: "Caretaker Applications",
                href: "/admin/applications",
                icon: UserCheck,
                urgent: false,
                description: "Application lifecycle management",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-slate-200
                    p-4
                    transition
                    hover:border-blue-200
                    hover:bg-slate-50
                    dark:border-slate-700
                    dark:hover:border-slate-600
                    dark:hover:bg-slate-800/60
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#003898] dark:bg-blue-950/50 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#091E42] dark:text-yellow-200">
                        {item.label}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    {item.urgent && (
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    )}

                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#0052CC] dark:text-slate-600 dark:group-hover:text-blue-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      {/* ============================================================
    PRINT-ONLY ENTERPRISE REPORT
============================================================ */}

      <section className="admin-print-report">
        {/* ============================================================
      COVER PAGE
  ============================================================ */}

        <div className="report-cover">
          <div className="report-cover-inner">
            <img
              src="/images/carelink-logo.png"
              alt="CareLink+"
              className="report-logo"
            />

            <div className="report-cover-divider" />

            <h1>CARELINK+ FULL PLATFORM REPORT</h1>

            <p className="report-cover-subtitle">
              Administrative Analytics &amp; Caretaker Application Report
            </p>

            <div className="report-cover-meta">
              <p>
                <strong>Generated:</strong> {reportGeneratedAt || "—"}
              </p>

              <p>
                <strong>Platform:</strong> CareLink+
              </p>

              <p>
                <strong>Report Type:</strong> Full Administrative Report
              </p>
            </div>

            <div className="report-cover-footer">
              <p>CareLink+</p>

              <p>
                Connecting families with trusted care services across Sri Lanka.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
      MAIN REPORT
  ============================================================ */}

        <div className="report-page">
          <div className="report-header">
            <div>
              <h2>CareLink+ Full Platform Report</h2>

              <p>Administrative analytics summary</p>
            </div>

            <img
              src="/images/carelink-logo.png"
              alt="CareLink+"
              className="report-small-logo"
            />
          </div>

          {/* ============================================================
        PLATFORM SUMMARY
    ============================================================ */}

          <section className="report-section">
            <h3>Platform Summary</h3>

            <div className="report-kpi-grid">
              <div className="report-kpi">
                <span>Total Registered Users</span>
                <strong>{stats?.totalUsers || 0}</strong>
              </div>

              <div className="report-kpi">
                <span>Total Caretakers</span>
                <strong>{stats?.totalCaretakers || 0}</strong>
              </div>

              <div className="report-kpi">
                <span>Total Bookings</span>
                <strong>{stats?.totalBookings || 0}</strong>
              </div>

              <div className="report-kpi">
                <span>Total Revenue</span>
                <strong>{formatCurrency(stats?.totalRevenue || 0)}</strong>
              </div>

              <div className="report-kpi">
                <span>Total Clients</span>
                <strong>{stats?.totalClients || 0}</strong>
              </div>

              <div className="report-kpi">
                <span>Pending Applications</span>
                <strong>{stats?.pendingApplications || 0}</strong>
              </div>

              <div className="report-kpi">
                <span>Approved Applications</span>
                <strong>{stats?.approvedApplications || 0}</strong>
              </div>

              <div className="report-kpi">
                <span>Rejected Applications</span>
                <strong>{stats?.rejectedApplications || 0}</strong>
              </div>
            </div>
          </section>

          {/* ============================================================
        REGISTERED USER DISTRIBUTION
    ============================================================ */}

          <section className="report-section">
            <h3>Registered User Distribution</h3>

            {/* =====================================================
                 USER DISTRIBUTION DONUT GRAPH
            ====================================================== */}
            {/* <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "40px",
                marginBottom: "20px",
                padding: "18px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "170px",
                  height: "170px",
                  borderRadius: "50%",
                  background: `conic-gradient(
                    #3B82F6 0 ${reportUserPercentages.family}%,
                    #10B981 ${reportUserPercentages.family}% ${
                      reportUserPercentages.family +
                      reportUserPercentages.caretaker
                    }%,
                    #8B5CF6 ${
                      reportUserPercentages.family +
                      reportUserPercentages.caretaker
                    }% 100%
                  )`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "27px",
                    left: "27px",
                    width: "116px",
                    height: "116px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "28px",
                      color: "#091e42",
                    }}
                  >
                    {reportUserTotal}
                  </strong>

                  <span
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    Accounts
                  </span>
                </div>
              </div>

              <div
                style={{
                  minWidth: "220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "11px",
                }}
              >
                <div>
                  <strong style={{ color: "#3B82F6" }}>Family Members</strong>

                  <span style={{ marginLeft: "8px" }}>
                    {roleDistribution.familyMembers} (
                    {reportUserPercentages.family.toFixed(1)}%)
                  </span>
                </div>

                <div>
                  <strong style={{ color: "#10B981" }}>Caretakers</strong>

                  <span style={{ marginLeft: "8px" }}>
                    {roleDistribution.caretakers} (
                    {reportUserPercentages.caretaker.toFixed(1)}%)
                  </span>
                </div>

                <div>
                  <strong style={{ color: "#8B5CF6" }}>Administrators</strong>

                  <span style={{ marginLeft: "8px" }}>
                    {roleDistribution.admins} (
                    {reportUserPercentages.admin.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div> */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "40px",
                marginBottom: "20px",
                padding: "18px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              {(() => {
                const circumference = 2 * Math.PI * 65;

                const familyLength =
                  (reportUserPercentages.family / 100) * circumference;

                const caretakerLength =
                  (reportUserPercentages.caretaker / 100) * circumference;

                const adminLength =
                  (reportUserPercentages.admin / 100) * circumference;

                return (
                  <>
                    {/* DONUT */}
                    <svg
                      width="170"
                      height="170"
                      viewBox="0 0 170 170"
                      style={{
                        flexShrink: 0,
                        overflow: "visible",
                      }}
                    >
                      {/* Base ring */}
                      <circle
                        cx="85"
                        cy="85"
                        r="65"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="24"
                      />

                      {/* Family Members */}
                      {reportUserPercentages.family > 0 && (
                        <circle
                          cx="85"
                          cy="85"
                          r="65"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="24"
                          strokeDasharray={`${familyLength} ${
                            circumference - familyLength
                          }`}
                          strokeDashoffset="0"
                          transform="rotate(-90 85 85)"
                        />
                      )}

                      {/* Caretakers */}
                      {reportUserPercentages.caretaker > 0 && (
                        <circle
                          cx="85"
                          cy="85"
                          r="65"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="24"
                          strokeDasharray={`${caretakerLength} ${
                            circumference - caretakerLength
                          }`}
                          strokeDashoffset={-familyLength}
                          transform="rotate(-90 85 85)"
                        />
                      )}

                      {/* Administrators */}
                      {reportUserPercentages.admin > 0 && (
                        <circle
                          cx="85"
                          cy="85"
                          r="65"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="24"
                          strokeDasharray={`${adminLength} ${
                            circumference - adminLength
                          }`}
                          strokeDashoffset={-(familyLength + caretakerLength)}
                          transform="rotate(-90 85 85)"
                        />
                      )}

                      {/* White center */}
                      <circle cx="85" cy="85" r="48" fill="#ffffff" />

                      {/* Total */}
                      <text
                        x="85"
                        y="80"
                        textAnchor="middle"
                        fontSize="28"
                        fontWeight="700"
                        fill="#091e42"
                      >
                        {reportUserTotal}
                      </text>

                      <text
                        x="85"
                        y="98"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#64748b"
                        style={{
                          textTransform: "uppercase",
                        }}
                      >
                        ACCOUNTS
                      </text>
                    </svg>

                    {/* LEGEND */}
                    <div
                      style={{
                        minWidth: "220px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        fontSize: "11px",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#3B82F6" }}>
                          Family Members
                        </strong>

                        <span style={{ marginLeft: "8px" }}>
                          {roleDistribution.familyMembers} (
                          {reportUserPercentages.family.toFixed(1)}%)
                        </span>
                      </div>

                      <div>
                        <strong style={{ color: "#10B981" }}>Caretakers</strong>

                        <span style={{ marginLeft: "8px" }}>
                          {roleDistribution.caretakers} (
                          {reportUserPercentages.caretaker.toFixed(1)}%)
                        </span>
                      </div>

                      <div>
                        <strong style={{ color: "#8B5CF6" }}>
                          Administrators
                        </strong>

                        <span style={{ marginLeft: "8px" }}>
                          {roleDistribution.admins} (
                          {reportUserPercentages.admin.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "left",
                      background: "#f1f5f9",
                    }}
                  >
                    User Type
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      background: "#f1f5f9",
                    }}
                  >
                    Count
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      background: "#f1f5f9",
                    }}
                  >
                    Percentage
                  </th>
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    label: "Family Members",
                    value: roleDistribution.familyMembers,
                  },
                  {
                    label: "Caretakers",
                    value: roleDistribution.caretakers,
                  },
                  {
                    label: "Administrators",
                    value: roleDistribution.admins,
                  },
                ].map((item) => {
                  const total =
                    roleDistribution.familyMembers +
                    roleDistribution.caretakers +
                    roleDistribution.admins;

                  const percentage = total > 0 ? (item.value / total) * 100 : 0;

                  return (
                    <tr key={item.label}>
                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "9px",
                        }}
                      >
                        {item.label}
                      </td>

                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "9px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {item.value}
                      </td>

                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "9px",
                          textAlign: "right",
                        }}
                      >
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      fontWeight: 800,
                    }}
                  >
                    Total Registered Accounts
                  </td>

                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      fontWeight: 800,
                    }}
                  >
                    {roleDistribution.familyMembers +
                      roleDistribution.caretakers +
                      roleDistribution.admins}
                  </td>

                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      fontWeight: 800,
                    }}
                  >
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ============================================================
        CARETAKER APPLICATION STATUS
    ============================================================ */}

          <section className="report-section">
            <h3>Caretaker Application Status</h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "left",
                      background: "#f1f5f9",
                    }}
                  >
                    Application Status
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      background: "#f1f5f9",
                    }}
                  >
                    Count
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      background: "#f1f5f9",
                    }}
                  >
                    Percentage
                  </th>
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    label: "Pending",
                    value: applicationStats.pending,
                  },
                  {
                    label: "Approved",
                    value: applicationStats.approved,
                  },
                  {
                    label: "Rejected",
                    value: applicationStats.rejected,
                  },
                ].map((item) => {
                  const percentage =
                    totalApplicationsForReport > 0
                      ? (item.value / totalApplicationsForReport) * 100
                      : 0;

                  return (
                    <tr key={item.label}>
                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "9px",
                        }}
                      >
                        {item.label}
                      </td>

                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "9px",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {item.value}
                      </td>

                      <td
                        style={{
                          border: "1px solid #cbd5e1",
                          padding: "9px",
                          textAlign: "right",
                        }}
                      >
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      fontWeight: 800,
                    }}
                  >
                    Total Applications
                  </td>

                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      fontWeight: 800,
                    }}
                  >
                    {totalApplicationsForReport}
                  </td>

                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      fontWeight: 800,
                    }}
                  >
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* ============================================================
        MONTHLY CARETAKER REVENUE
    ============================================================ */}

          <section className="report-section">
            <h3>Monthly Caretaker Revenue</h3>

            <p className="report-description">
              Revenue from closed and paid bookings for all caretakers.
            </p>
            {/* ========================================================
                INDIVIDUAL CARETAKER MONTHLY REVENUE GRAPHS
            ========================================================= */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginBottom: "24px",
              }}
            >
              {reportCaretakerRevenueGroups.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #cbd5e1",
                    borderRadius: "10px",
                    padding: "20px",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  No caretaker revenue data available.
                </div>
              ) : (
                reportCaretakerRevenueGroups.map((caretaker) => {
                  const maxAmount = Math.max(
                    ...caretaker.months.map((item) => item.amount),
                    1,
                  );

                  const chartWidth = 760;
                  const chartHeight = 250;

                  const chartLeft = 42;
                  const chartRight = 15;
                  const chartTop = 30;
                  const chartBottom = 205;

                  const chartWidthInner = chartWidth - chartLeft - chartRight;

                  const chartHeightInner = chartBottom - chartTop;

                  const barSlotWidth = chartWidthInner / 12;

                  const barWidth = Math.min(barSlotWidth * 0.55, 30);

                  return (
                    <div
                      key={caretaker.caretakerName}
                      style={{
                        border: "1px solid #dbe3ec",
                        borderRadius: "12px",
                        padding: "14px 12px 10px",
                        background: "#ffffff",
                        breakInside: "avoid",
                        pageBreakInside: "avoid",
                      }}
                    >
                      {/* CARETAKER HEADER */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginBottom: "6px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#091e42",
                          }}
                        >
                          {caretaker.caretakerName}
                        </div>

                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          Annual Revenue:{" "}
                          <span
                            style={{
                              color: "#003898",
                            }}
                          >
                            {formatCurrency(caretaker.annualTotal)}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "9px",
                          color: "#64748b",
                          marginBottom: "5px",
                        }}
                      >
                        Monthly revenue from closed and paid bookings
                      </div>

                      {/* SVG GRAPH */}
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        width="100%"
                        height="250"
                        style={{
                          display: "block",
                        }}
                      >
                        {/* HORIZONTAL GRID LINES */}

                        <line
                          x1={chartLeft}
                          y1={chartTop}
                          x2={chartWidth - chartRight}
                          y2={chartTop}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />

                        <line
                          x1={chartLeft}
                          y1={chartTop + chartHeightInner / 2}
                          x2={chartWidth - chartRight}
                          y2={chartTop + chartHeightInner / 2}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />

                        <line
                          x1={chartLeft}
                          y1={chartBottom}
                          x2={chartWidth - chartRight}
                          y2={chartBottom}
                          stroke="#94a3b8"
                          strokeWidth="1.2"
                        />

                        {/* Y AXIS LABELS */}

                        <text
                          x="5"
                          y={chartTop + 4}
                          fontSize="8"
                          fill="#64748b"
                        >
                          {Math.round(maxAmount).toLocaleString("en-LK")}
                        </text>

                        <text
                          x="17"
                          y={chartTop + chartHeightInner / 2 + 3}
                          fontSize="8"
                          fill="#64748b"
                        >
                          {Math.round(maxAmount / 2).toLocaleString("en-LK")}
                        </text>

                        <text
                          x="28"
                          y={chartBottom + 3}
                          fontSize="8"
                          fill="#64748b"
                        >
                          0
                        </text>

                        {/* MONTHLY BARS */}

                        {caretaker.months.map((month, index) => {
                          const barHeight =
                            month.amount > 0
                              ? Math.max(
                                  (month.amount / maxAmount) * chartHeightInner,
                                  4,
                                )
                              : 2;

                          const x =
                            chartLeft +
                            index * barSlotWidth +
                            (barSlotWidth - barWidth) / 2;

                          const y = chartBottom - barHeight;

                          return (
                            <g key={month.key}>
                              {/* VALUE */}

                              {month.amount > 0 && (
                                <text
                                  x={x + barWidth / 2}
                                  y={y - 5}
                                  textAnchor="middle"
                                  fontSize="7"
                                  fontWeight="700"
                                  fill="#475569"
                                >
                                  {Math.round(month.amount).toLocaleString(
                                    "en-LK",
                                  )}
                                </text>
                              )}

                              {/* BAR */}

                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx="4"
                                fill={month.amount > 0 ? "#0052CC" : "#CBD5E1"}
                              />

                              {/* MONTH LABEL */}

                              <text
                                x={x + barWidth / 2}
                                y={chartBottom + 18}
                                textAnchor="middle"
                                fontSize="9"
                                fontWeight="700"
                                fill="#64748b"
                              >
                                {month.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  );
                })
              )}
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "8px",
                      background: "#f1f5f9",
                    }}
                  >
                    Month
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "8px",
                      textAlign: "right",
                      background: "#f1f5f9",
                    }}
                  >
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {reportMonthlyTotals.map((item) => (
                  <tr key={item.key}>
                    <td
                      style={{
                        border: "1px solid #cbd5e1",
                        padding: "8px",
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </td>

                    <td
                      style={{
                        border: "1px solid #cbd5e1",
                        padding: "8px",
                        textAlign: "right",
                        fontWeight: item.amount > 0 ? 700 : 400,
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      fontWeight: 800,
                      background: "#f8fafc",
                    }}
                  >
                    Annual Revenue
                  </td>

                  <td
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "9px",
                      textAlign: "right",
                      fontWeight: 800,
                      background: "#f8fafc",
                    }}
                  >
                    {formatCurrency(
                      reportMonthlyTotals.reduce(
                        (sum, item) => sum + item.amount,
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* ============================================================
        CARETAKER REVENUE DETAILS
    ============================================================ */}

          <section className="report-section">
            <h3>Caretaker Revenue Details</h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "10px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "7px",
                      background: "#f1f5f9",
                      textAlign: "left",
                    }}
                  >
                    Caretaker
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "7px",
                      background: "#f1f5f9",
                      textAlign: "left",
                    }}
                  >
                    Month
                  </th>

                  <th
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "7px",
                      background: "#f1f5f9",
                      textAlign: "right",
                    }}
                  >
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {monthlyRevenue.filter((item) => Number(item.revenue || 0) > 0)
                  .length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        border: "1px solid #cbd5e1",
                        padding: "12px",
                        textAlign: "center",
                      }}
                    >
                      No caretaker revenue records found.
                    </td>
                  </tr>
                ) : (
                  monthlyRevenue
                    .filter((item) => Number(item.revenue || 0) > 0)
                    .sort((a, b) => {
                      if (a.month !== b.month) {
                        return a.month.localeCompare(b.month);
                      }

                      return a.caretakerName.localeCompare(b.caretakerName);
                    })
                    .map((item, index) => (
                      <tr key={`${item.month}-${item.caretakerName}-${index}`}>
                        <td
                          style={{
                            border: "1px solid #cbd5e1",
                            padding: "7px",
                          }}
                        >
                          {item.caretakerName}
                        </td>

                        <td
                          style={{
                            border: "1px solid #cbd5e1",
                            padding: "7px",
                          }}
                        >
                          {getMonthShort(item.month)}
                        </td>

                        <td
                          style={{
                            border: "1px solid #cbd5e1",
                            padding: "7px",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {formatCurrency(Number(item.revenue || 0))}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </section>
        </div>

        {/* ============================================================
      CARETAKER APPLICATION DETAILS
  ============================================================ */}

        <div className="report-page applications-section">
          <div className="report-header">
            <div>
              <h2>Caretaker Applications &amp; Verification</h2>

              <p>Complete application details and verification information.</p>
            </div>

            <img
              src="/images/carelink-logo.png"
              alt="CareLink+"
              className="report-small-logo"
            />
          </div>

          {reportApplications.length === 0 ? (
            <div className="report-empty">
              No caretaker applications were returned by the server.
            </div>
          ) : (
            <div>
              {reportApplications.map((app, index) => {
                const applicant =
                  app.caretakerId?.name || app.fullName || "N/A";

                const submitted = app.submittedAt
                  ? new Date(app.submittedAt).toLocaleDateString("en-LK")
                  : "N/A";

                const reviewed = app.reviewedAt
                  ? new Date(app.reviewedAt).toLocaleDateString("en-LK")
                  : "N/A";

                return (
                  <div
                    key={app._id}
                    style={{
                      pageBreakInside: "avoid",
                      breakInside: "avoid",
                      marginBottom: "24px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "12px",
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "20px",
                        marginBottom: "12px",
                        paddingBottom: "8px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "#091e42",
                          }}
                        >
                          #{index + 1} — {applicant}
                        </strong>

                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: "9px",
                            color: "#64748b",
                          }}
                        >
                          Application ID: {app._id}
                        </p>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        <div>Status: {app.status || "N/A"}</div>

                        <div>
                          Verification: {app.verificationStatus || "N/A"}
                        </div>

                        <div>
                          Address Match:{" "}
                          {app.addressMatched === true
                            ? "Same"
                            : app.addressMatched === false
                              ? "Not Same"
                              : "Not Checked"}
                        </div>
                      </div>
                    </div>

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "10px",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              width: "18%",
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            NIC
                          </td>

                          <td
                            style={{
                              width: "32%",
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.nicNumber || "N/A"}
                          </td>

                          <td
                            style={{
                              width: "18%",
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Contact
                          </td>

                          <td
                            style={{
                              width: "32%",
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.contactNumber || "N/A"}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            District
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.district || "N/A"}
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Town
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.town || "N/A"}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Experience
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.experience || "N/A"}
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Qualifications
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.qualifications || "N/A"}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Profile Address
                          </td>

                          <td
                            colSpan={3}
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.profileAddress || app.address || "N/A"}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            NIC Address
                          </td>

                          <td
                            colSpan={3}
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {app.nicAddress || "N/A"}
                          </td>
                        </tr>

                        <tr>
                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Submitted
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {submitted}
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                              fontWeight: 700,
                              background: "#f8fafc",
                            }}
                          >
                            Reviewed
                          </td>

                          <td
                            style={{
                              border: "1px solid #e2e8f0",
                              padding: "6px",
                            }}
                          >
                            {reviewed}
                          </td>
                        </tr>

                        {app.adminNote && (
                          <tr>
                            <td
                              style={{
                                border: "1px solid #e2e8f0",
                                padding: "6px",
                                fontWeight: 700,
                                background: "#f8fafc",
                              }}
                            >
                              Admin Note
                            </td>

                            <td
                              colSpan={3}
                              style={{
                                border: "1px solid #e2e8f0",
                                padding: "6px",
                              }}
                            >
                              {app.adminNote}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          <div className="report-footer">
            <span>CareLink+ Full Administrative Report</span>

            <span>
              Generated{" "}
              {reportGeneratedAt
                ? new Date(reportGeneratedAt).toLocaleDateString("en-LK")
                : new Date().toLocaleDateString("en-LK")}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
