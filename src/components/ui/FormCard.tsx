
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface FormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const FormCard: React.FC<FormCardProps> = ({ title, description, children, footer, className }) => {
  return (
    <Card className={cn("w-full max-w-md mx-auto shadow-lg border-app-blue-200", className)}>
      <CardHeader className="space-y-1 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-center">{title}</CardTitle>
        {description && <CardDescription className="text-center text-sm sm:text-base">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 sm:px-6">{children}</CardContent>
      {footer && <CardFooter className="px-4 sm:px-6">{footer}</CardFooter>}
    </Card>
  );
};

export default FormCard;
