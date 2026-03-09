import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: string;
  children?: ReactNode;
}

/** Consistent page header for each tool section. */
export default function PageHeader({ title, description, icon, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-dark-50">{title}</h2>
      </div>
      <p className="text-sm text-dark-400 ml-10">{description}</p>
      {children}
    </div>
  );
}
