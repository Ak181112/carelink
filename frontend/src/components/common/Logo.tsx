import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      

      <h1 className="text-3xl font-bold tracking-tight">
        <span className="text-[#003898]">CareLink+</span>
      </h1>
    </Link>
  );
}