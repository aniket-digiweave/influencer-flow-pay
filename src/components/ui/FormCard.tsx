
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
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-center">{title}</CardTitle>
        {description && <CardDescription className="text-center">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default FormCard;
