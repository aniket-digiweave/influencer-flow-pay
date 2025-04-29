
import React from "react";
import PageLayout from "@/components/layouts/PageLayout";
import ClientForm from "@/components/forms/ClientForm";

const ClientPage = () => {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Client Payment Confirmation</h1>
          <p className="text-muted-foreground mt-2">
            Confirm that you've completed the payment for your influencer collaboration
          </p>
        </div>
        
        <ClientForm />
      </div>
    </PageLayout>
  );
};

export default ClientPage;
