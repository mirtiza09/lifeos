import React from "react";
import { Heart, Rocket, Briefcase, User } from "lucide-react";
import { Link } from "wouter";

// Create a reusable category component to maintain consistency
const CategoryBox = ({ 
  icon: Icon, 
  label, 
  to 
}: { 
  icon: React.ElementType; 
  label: string; 
  to: string;
}) => (
  <Link href={to}>
    <div className="border border-border aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors">
      <Icon className="w-10 h-10 mb-4 stroke-[1.25]" />
      <span>{label}</span>
    </div>
  </Link>
);

export default function LifeCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <CategoryBox icon={Heart} label="Health" to="/health" />
      <CategoryBox icon={Rocket} label="Career" to="/career" />
      <CategoryBox icon={Briefcase} label="Finances" to="/finances" />
      <CategoryBox icon={User} label="Personal" to="/personal" />
    </div>
  );
}
