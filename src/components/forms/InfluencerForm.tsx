
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import FormCard from "@/components/ui/FormCard";
import { useToast } from "@/components/ui/use-toast";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import { 
  getBrands, 
  getInfluencersByBrand, 
  submitInfluencerForm 
} from "@/services/supabaseService";

const InfluencerForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    brand: "",
    customBrand: "",
    influencerName: "",
    amount: 0,
    instagramLink: "",
    email: "",
    paymentMethod: "bank",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
    upiQrCode: null as File | null,
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandNames = await getBrands();
        console.log("Fetched brands:", brandNames);
        setBrands(brandNames);
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast({
          title: "Error",
          description: "Could not load brands. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    fetchBrands();
  }, [toast]);
  
  // Fetch influencers when brand changes
  useEffect(() => {
    const fetchInfluencers = async () => {
      if (formData.brand) {
        try {
          const influencersList = await getInfluencersByBrand(formData.brand);
          console.log("Fetched influencers for brand", formData.brand, ":", influencersList);
          setInfluencers(influencersList);
          
          // Reset influencer selection
          setFormData(prev => ({
            ...prev,
            influencerName: '',
            amount: 0
          }));
          
          setPendingAmount(null);
        } catch (error) {
          console.error("Error fetching influencers:", error);
          toast({
            title: "Error",
            description: "Could not load influencers. Please try again later.",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchInfluencers();
  }, [formData.brand, toast]);
  
  // Update pending amount when influencer changes
  useEffect(() => {
    if (formData.influencerName) {
      const selectedInfluencer = influencers.find(inf => inf.influencer_name === formData.influencerName);
      if (selectedInfluencer) {
        console.log("Selected influencer:", selectedInfluencer);
        setPendingAmount(selectedInfluencer.pending_amount);
        setFormData(prev => ({
          ...prev,
          amount: selectedInfluencer.pending_amount
        }));
      } else {
        setPendingAmount(null);
      }
    } else {
      setPendingAmount(null);
    }
  }, [formData.influencerName, influencers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Changing ${name} to ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
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
    
    if (!formData.influencerName) {
      toast({
        title: "Error",
        description: "Please select an influencer",
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
    
    if (formData.paymentMethod === "bank") {
      if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
        toast({
          title: "Error",
          description: "Please fill in all bank details",
          variant: "destructive",
        });
        return false;
      }
    } else if (formData.paymentMethod === "upi") {
      if (!formData.upiId && !formData.upiQrCode) {
        toast({
          title: "Error",
          description: "Please enter your UPI ID or upload QR code",
          variant: "destructive",
        });
        return false;
      }
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
      const result = await submitInfluencerForm(formData);
      
      if (result.success && result.data) {
        // Show success message
        setPaymentId(result.data.payment_id);
        setShowConfetti(true);
        setShowSuccess(true);
        
        // Reset form
        setFormData({
          brand: "",
          customBrand: "",
          influencerName: "",
          amount: 0,
          instagramLink: "",
          email: "",
          paymentMethod: "bank",
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          upiId: "",
          upiQrCode: null,
        });
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Something went wrong. Please try again later.",
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
        <Card className="w-full max-w-md mx-auto p-4 sm:p-6 animate-scale-in">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-app-green-100 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold">Thank You!</h2>
            <p className="text-muted-foreground">Your submission was successful!</p>
            <div className="py-4 w-full">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Your Payment ID</h3>
              <div className="bg-app-blue-100 rounded-lg p-3 font-mono text-base sm:text-lg break-all">
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

            {formData.brand && (
              <div className="space-y-2">
                <Label htmlFor="influencerName">Influencer Name</Label>
                <Select
                  value={formData.influencerName}
                  onValueChange={(value) => handleSelectChange("influencerName", value)}
                >
                  <SelectTrigger id="influencerName">
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {influencers.map((influencer) => (
                      <SelectItem key={influencer.id} value={influencer.influencer_name}>
                        {influencer.influencer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {pendingAmount !== null && (
              <div className="p-3 bg-app-blue-100 rounded-md">
                <p className="text-sm font-medium">Pending Amount: ₹{pendingAmount}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.paymentMethod === "bank" ? "default" : "outline"}
                  onClick={() => handleSelectChange("paymentMethod", "bank")}
                  className="w-full"
                >
                  Bank Transfer
                </Button>
                <Button
                  type="button"
                  variant={formData.paymentMethod === "upi" ? "default" : "outline"}
                  onClick={() => handleSelectChange("paymentMethod", "upi")}
                  className="w-full"
                >
                  UPI
                </Button>
              </div>
            </div>

            {formData.paymentMethod === "bank" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    name="accountHolderName"
                    placeholder="Enter account holder name"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    name="ifscCode"
                    placeholder="Enter IFSC code"
                    value={formData.ifscCode}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    placeholder="Enter bank name"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID or Upload QR Code</Label>
                <Input
                  id="upiId"
                  name="upiId"
                  placeholder="your@upi"
                  value={formData.upiId}
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
