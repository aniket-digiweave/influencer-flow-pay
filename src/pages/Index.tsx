
import React, { useEffect } from "react";
import PageLayout from "@/components/layouts/PageLayout";
import InfluencerForm from "@/components/forms/InfluencerForm";
import { createStorageBuckets } from "@/services/createStorageBuckets";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Initialize storage buckets if needed
    createStorageBuckets();
    
    // Check for authentication
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Current session:", data.session ? "Authenticated" : "Not authenticated");
    };
    
    checkSession();
  }, []);
  
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
