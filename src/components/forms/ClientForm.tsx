
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FormCard from "@/components/ui/FormCard";
import { useToast } from "@/components/ui/use-toast";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import { submitClientPayment, getSubmissionById, InfluencerSubmission } from "@/services/paymentService";

const ClientForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    paymentId: "",
    screenshot: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [influencer, setInfluencer] = useState<InfluencerSubmission | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      // Convert file to base64 string for demo purposes
      // In a real app, you would upload this to storage
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, [name]: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
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
      // Look up the payment ID first
      const submission = getSubmissionById(formData.paymentId);
      
      if (!submission) {
        toast({
          title: "Payment ID Not Found",
          description: "Please check the Payment ID and try again",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Submit payment confirmation
      const result = submitClientPayment(
        formData.paymentId,
        formData.screenshot
      );
      
      if (result.success && result.submission) {
        // Show success message
        setInfluencer(result.submission);
        setShowConfetti(true);
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          paymentId: "",
          screenshot: "",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to process payment confirmation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
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
                <p><span className="font-medium">Brand:</span> {influencer?.brand}</p>
                <p><span className="font-medium">Payment ID:</span> {influencer?.id}</p>
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
                    src={formData.screenshot}
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
