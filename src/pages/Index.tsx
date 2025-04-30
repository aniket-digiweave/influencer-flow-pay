
import React from "react";
import PageLayout from "@/components/layouts/PageLayout";
import InfluencerForm from "@/components/forms/InfluencerForm";

const Index = () => {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Digiweave's Influencer Payment Manager</h1>
          <p className="text-muted-foreground mt-2">
            Submit your details to get paid for your brand collaboration
          </p>
        </div>
        
        <InfluencerForm />
      </div>
    </PageLayout>
  );
};

export default Index;
