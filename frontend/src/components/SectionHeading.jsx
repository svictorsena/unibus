import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({ title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#39343F] py-3">
      <h3 className="m-0 text-sm font-bold">{title}</h3>
      <Link
        to={to}
        className="flex items-center gap-1 text-[11px] font-semibold text-[#FFD84A] no-underline"
      >
        {linkLabel}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
