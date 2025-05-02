
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  getBrands, 
  getInfluencersByBrand,
  getPendingPaymentsForInfluencer,
  submitInfluencerForm 
} from "@/services/supabaseService";

const InfluencerForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState({
    instagramLink: '',
    email: '',
    upiId: '',
  });
  
  const [formData, setFormData] = useState({
    brand: "",
    customBrand: "",
    instagramHandle: "",
    amount: 0,
    instagramLink: "",
    email: "",
    paymentMethod: "upi",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
    upiQrCode: null as File | null,
    paymentId: "",
    isCollaboration: "Yes"
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

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
            instagramHandle: '',
            amount: 0,
            paymentId: ''
          }));
          
          setPendingPayments([]);
          setHasPendingPayment(false);
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
  
  // Update pending payments when influencer changes
  useEffect(() => {
    const fetchPendingPayments = async () => {
      if (formData.instagramHandle && formData.brand) {
        try {
          const payments = await getPendingPaymentsForInfluencer(formData.instagramHandle, formData.brand);
          setPendingPayments(payments);
          
          const hasPayments = payments && payments.length > 0;
          setHasPendingPayment(hasPayments);
          
          if (hasPayments) {
            // If there's only one payment, auto-select it
            if (payments.length === 1) {
              setFormData(prev => ({
                ...prev,
                amount: payments[0].amount,
                paymentId: payments[0].payment_id || ''
              }));
            } else {
              // Reset amount if there are multiple payments to choose from
              setFormData(prev => ({
                ...prev,
                amount: 0,
                paymentId: ''
              }));
            }
          } else {
            // No pending payments
            setFormData(prev => ({
              ...prev,
              amount: 0,
              paymentId: ''
            }));
          }
        } catch (error) {
          console.error("Error fetching pending payments:", error);
          toast({
            title: "Error",
            description: "Could not load payment information. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        setPendingPayments([]);
        setHasPendingPayment(false);
      }
    };
    
    fetchPendingPayments();
  }, [formData.instagramHandle, formData.brand, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific error when user types in the field
    if (name in formErrors) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Changing ${name} to ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific error when user changes selection
    if (name in formErrors) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
    }
  };
  
  const handlePaymentSelect = (paymentId: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      paymentId,
      amount
    }));
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = { instagramLink: '', email: '', upiId: '' };
    
    // Instagram Link validation
    if (formData.instagramLink) {
      if (!formData.instagramLink.includes('instagram.com')) {
        newErrors.instagramLink = 'The link must be from instagram.com';
        isValid = false;
      }
    } else {
      newErrors.instagramLink = 'Instagram post link is required';
      isValid = false;
    }
    
    // Email validation
    if (formData.email) {
      if (!formData.email.includes('@')) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      } else if (formData.instagramHandle && !formData.email.toLowerCase().includes(formData.instagramHandle.toLowerCase())) {
        newErrors.email = 'Email should include your Instagram username';
        isValid = false;
      }
    } else {
      newErrors.email = 'Email is required';
      isValid = false;
    }
    
    // UPI ID validation
    if (formData.paymentMethod === 'upi' && formData.upiId) {
      const parts = formData.upiId.split('@');
      if (parts.length !== 2 || parts[0].length < 3 || parts[1].length < 3) {
        newErrors.upiId = 'UPI ID should be in format username@provider';
        isValid = false;
      }
    }
    
    // Payment method validation
    if (formData.paymentMethod === "bank") {
      if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
        toast({
          title: "Error",
          description: "Please fill in all bank details",
          variant: "destructive",
        });
        isValid = false;
      }
    } else if (formData.paymentMethod === "upi") {
      if (!formData.upiId && !formData.upiQrCode) {
        toast({
          title: "Error",
          description: "Please enter your UPI ID or upload QR code",
          variant: "destructive",
        });
        isValid = false;
      }
    }
    
    // Basic checks for required fields
    if (!formData.brand || !formData.instagramHandle) {
      toast({
        title: "Error",
        description: "Please select a brand and Instagram username",
        variant: "destructive",
      });
      isValid = false;
    }
    
    // Check if there's a pending payment before submission
    if (!hasPendingPayment) {
      toast({
        title: "Error",
        description: "You don't have any pending payments",
        variant: "destructive",
      });
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
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
        // Success handling
        setPaymentId(result.data.payment_id);
        setShowConfetti(true);
        setShowSuccess(true);

        // Reset form
        setFormData({
          brand: "",
          customBrand: "",
          instagramHandle: "",
          amount: 0,
          instagramLink: "",
          email: "",
          paymentMethod: "upi",
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          bankName: "",
          upiId: "",
          upiQrCode: null,
          paymentId: "",
          isCollaboration: "Yes"
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
                <Label htmlFor="instagramHandle">Instagram Username</Label>
                <Select
                  value={formData.instagramHandle}
                  onValueChange={(value) => handleSelectChange("instagramHandle", value)}
                >
                  <SelectTrigger id="instagramHandle">
                    <SelectValue placeholder="Select your username" />
                  </SelectTrigger>
                  <SelectContent>
                    {influencers.map((influencer) => (
                      <SelectItem key={influencer.id || influencer.instagram_handle} value={influencer.instagram_handle}>
                        {influencer.instagram_handle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.instagramHandle && (
              <>
                {pendingPayments.length === 0 ? (
                  <div className="p-3 bg-red-100 text-red-800 rounded-md">
                    <p className="text-sm font-medium">You have no pending payments</p>
                  </div>
                ) : pendingPayments.length === 1 ? (
                  <div className="p-3 bg-app-blue-100 rounded-md">
                    <p className="text-sm font-medium">Pending Amount: ₹{pendingPayments[0].amount}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="pendingPayment">Select Pending Payment</Label>
                    <Select
                      value={formData.paymentId}
                      onValueChange={(value) => {
                        const selectedPayment = pendingPayments.find(p => p.payment_id === value);
                        if (selectedPayment) {
                          handlePaymentSelect(value, selectedPayment.amount);
                        }
                      }}
                    >
                      <SelectTrigger id="pendingPayment">
                        <SelectValue placeholder="Select payment" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingPayments.map((payment) => (
                          <SelectItem key={payment.id} value={payment.payment_id || payment.id}>
                            {payment.brand_name} - ₹{payment.amount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>Was this post a collaboration?</Label>
              <RadioGroup
                value={formData.isCollaboration}
                onValueChange={(value) => handleSelectChange("isCollaboration", value)}
                className="flex space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="collab-yes" />
                  <Label htmlFor="collab-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="collab-no" />
                  <Label htmlFor="collab-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramLink">Instagram Post Link</Label>
              <Input
                id="instagramLink"
                name="instagramLink"
                type="url"
                placeholder="https://www.instagram.com/p/..."
                value={formData.instagramLink}
                onChange={handleChange}
                disabled={!hasPendingPayment}
              />
              {formErrors.instagramLink && (
                <p className="text-sm text-red-500">{formErrors.instagramLink}</p>
              )}
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
                disabled={!hasPendingPayment}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Payment confirmation will be sent to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.paymentMethod === "upi" ? "default" : "outline"}
                  onClick={() => handleSelectChange("paymentMethod", "upi")}
                  className="w-full"
                  disabled={!hasPendingPayment}
                >
                  UPI
                </Button>
                <Button
                  type="button"
                  variant={formData.paymentMethod === "bank" ? "default" : "outline"}
                  onClick={() => handleSelectChange("paymentMethod", "bank")}
                  className="w-full"
                  disabled={!hasPendingPayment}
                >
                  Bank Transfer
                </Button>
              </div>
            </div>

            {formData.paymentMethod === "bank" && hasPendingPayment && (
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

            {formData.paymentMethod === "upi" && hasPendingPayment && (
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
                {formErrors.upiId && (
                  <p className="text-sm text-red-500">{formErrors.upiId}</p>
                )}
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
              disabled={loading || !hasPendingPayment}
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
