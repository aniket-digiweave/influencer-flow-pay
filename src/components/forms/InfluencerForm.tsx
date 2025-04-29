
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import FormCard from "@/components/ui/FormCard";
import { useToast } from "@/components/ui/use-toast";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import { getBrands, submitInfluencerForm } from "@/services/paymentService";

const InfluencerForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    customBrand: "",
    instagramLink: "",
    email: "",
    paymentMethod: "bank",
    bankDetails: "",
    upiQrCode: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const brands = getBrands();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
          setFormData((prev) => ({ ...prev, [name]: event.target?.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.brand) {
      toast({
        title: "Error",
        description: "Please select a brand",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.brand === "Other" && !formData.customBrand) {
      toast({
        title: "Error",
        description: "Please enter the brand name",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.instagramLink) {
      toast({
        title: "Error",
        description: "Please enter your Instagram post link",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }
    
    if (
      formData.paymentMethod === "bank" && !formData.bankDetails ||
      formData.paymentMethod === "upi" && !formData.upiQrCode
    ) {
      toast({
        title: "Error",
        description: "Please enter your payment details",
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
      // Get the actual brand name (selected or custom)
      const brandName = formData.brand === "Other" ? formData.customBrand : formData.brand;
      
      // Get payment details based on selected method
      const paymentDetails = 
        formData.paymentMethod === "bank" 
          ? formData.bankDetails 
          : formData.upiQrCode;
          
      // Submit form to service
      const result = submitInfluencerForm(
        brandName,
        formData.instagramLink,
        paymentDetails,
        formData.paymentMethod as "bank" | "upi",
        formData.email
      );
      
      // Show success message
      setPaymentId(result.id);
      setShowConfetti(true);
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        brand: "",
        customBrand: "",
        instagramLink: "",
        email: "",
        paymentMethod: "bank",
        bankDetails: "",
        upiQrCode: "",
      });
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
            <h2 className="text-2xl font-semibold">Thank You!</h2>
            <p className="text-muted-foreground">Your submission was successful!</p>
            <div className="py-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Your Payment ID</h3>
              <div className="bg-app-blue-100 rounded-lg p-3 font-mono text-lg">
                {paymentId}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Save this ID. The brand will use it to confirm your payment.
              </p>
            </div>
            <Button 
              onClick={() => setShowSuccess(false)} 
              variant="default" 
              className="mt-4"
            >
              Submit Another
            </Button>
          </div>
        </Card>
      ) : (
        <FormCard 
          title="Influencer Payment Request" 
          description="Submit your details to receive payment for your collaboration."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => handleSelectChange("brand", value)}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.brand === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customBrand">Brand Name</Label>
                <Input
                  id="customBrand"
                  name="customBrand"
                  placeholder="Enter brand name"
                  value={formData.customBrand}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="instagramLink">Instagram Post Link</Label>
              <Input
                id="instagramLink"
                name="instagramLink"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={formData.instagramLink}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Payment confirmation will be sent to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={formData.paymentMethod === "bank" ? "default" : "outline"}
                  onClick={() => handleSelectChange("paymentMethod", "bank")}
                  className="flex-1"
                >
                  Bank Transfer
                </Button>
                <Button
                  type="button"
                  variant={formData.paymentMethod === "upi" ? "default" : "outline"}
                  onClick={() => handleSelectChange("paymentMethod", "upi")}
                  className="flex-1"
                >
                  UPI
                </Button>
              </div>
            </div>

            {formData.paymentMethod === "bank" && (
              <div className="space-y-2">
                <Label htmlFor="bankDetails">Bank Details</Label>
                <Textarea
                  id="bankDetails"
                  name="bankDetails"
                  placeholder="Account Number, IFSC Code, Bank Name, Account Holder Name"
                  rows={4}
                  value={formData.bankDetails}
                  onChange={handleChange}
                />
              </div>
            )}

            {formData.paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upiQrCode">UPI ID or Upload QR Code</Label>
                <Input
                  id="upiId"
                  name="upiId"
                  placeholder="your@upi"
                  value={formData.upiQrCode}
                  onChange={handleChange}
                  className="mb-2"
                />
                <Input
                  id="upiQrCode"
                  name="upiQrCode"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit Details"}
            </Button>
          </form>
        </FormCard>
      )}
    </>
  );
};

export default InfluencerForm;
