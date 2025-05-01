
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FormCard from "@/components/ui/FormCard";
import { useToast } from "@/components/ui/use-toast";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import { submitClientPayment } from "@/services/supabaseService";

const ClientForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    paymentId: "",
    screenshot: null as File | null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
    }
  };

  const validateForm = () => {
    if (!formData.paymentId) {
      toast({
        title: "Error",
        description: "Please enter the Payment ID",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.screenshot) {
      toast({
        title: "Error",
        description: "Please upload a payment screenshot",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await submitClientPayment(formData);
      
      if (result.success && result.data) {
        // Show success message
        setPaymentConfirmation(result.data);
        setShowConfetti(true);
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          paymentId: "",
          screenshot: null,
        });
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to process payment confirmation",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showConfetti && <ConfettiEffect duration={5000} />}
      
      {showSuccess ? (
        <Card className="w-full max-w-md mx-auto p-6 animate-scale-in">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-app-green-100 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Payment Confirmed!</h2>
            <p className="text-muted-foreground">
              The payment has been recorded successfully.
            </p>
            <div className="py-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Payment Details</h3>
              <div className="bg-app-blue-100 rounded-lg p-3 text-left">
                <p><span className="font-medium">Brand:</span> {paymentConfirmation?.submission?.brand || 'N/A'}</p>
                <p><span className="font-medium">Payment ID:</span> {paymentConfirmation?.payment_id}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Confirmation email has been sent to the influencer.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowSuccess(false)} 
              variant="default" 
              className="mt-4"
            >
              Confirm Another Payment
            </Button>
          </div>
        </Card>
      ) : (
        <FormCard 
          title="Client Payment Confirmation" 
          description="Confirm that you've completed payment to the influencer."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentId">Payment ID</Label>
              <Input
                id="paymentId"
                name="paymentId"
                placeholder="PAY-12345"
                value={formData.paymentId}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Enter the Payment ID provided by the influencer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
              <Input
                id="screenshot"
                name="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                This will be sent to the influencer as proof of payment
              </p>
            </div>

            {formData.screenshot && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview</p>
                <div className="relative h-40 overflow-hidden rounded-md">
                  <img
                    src={URL.createObjectURL(formData.screenshot)}
                    alt="Payment Screenshot"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </form>
        </FormCard>
      )}
    </>
  );
};

export default ClientForm;
