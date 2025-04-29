
// Types for our data
export interface InfluencerSubmission {
  id: string;
  brand: string;
  instagramLink: string;
  paymentDetails: string;
  paymentMethod: "bank" | "upi";
  email: string;
  createdAt: Date;
  status: "pending" | "paid";
}

export interface ClientPayment {
  paymentId: string;
  screenshot: string;
  processedAt: Date;
}

// Mock database
let influencerSubmissions: InfluencerSubmission[] = [];
let clientPayments: ClientPayment[] = [];

// Generate unique ID
export const generatePaymentId = (): string => {
  const prefix = "PAY";
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
  return `${prefix}-${randomPart}`;
};

// Submit influencer form
export const submitInfluencerForm = (
  brand: string,
  instagramLink: string,
  paymentDetails: string,
  paymentMethod: "bank" | "upi",
  email: string
): InfluencerSubmission => {
  const newSubmission: InfluencerSubmission = {
    id: generatePaymentId(),
    brand,
    instagramLink,
    paymentDetails,
    paymentMethod,
    email,
    createdAt: new Date(),
    status: "pending",
  };

  influencerSubmissions.push(newSubmission);
  console.log("New influencer submission:", newSubmission);
  return newSubmission;
};

// Submit client payment
export const submitClientPayment = (
  paymentId: string,
  screenshot: string
): { success: boolean; submission?: InfluencerSubmission } => {
  
  const submission = influencerSubmissions.find(
    (item) => item.id === paymentId
  );
  
  if (!submission) {
    console.error("Payment ID not found:", paymentId);
    return { success: false };
  }
  
  submission.status = "paid";
  
  const newPayment: ClientPayment = {
    paymentId,
    screenshot,
    processedAt: new Date(),
  };
  
  clientPayments.push(newPayment);
  console.log("New client payment:", newPayment);
  
  // In a real app, we would send an email here
  console.log(`Email would be sent to ${submission.email} with payment confirmation`);
  
  return { success: true, submission };
};

// Get submission by ID
export const getSubmissionById = (
  id: string
): InfluencerSubmission | undefined => {
  return influencerSubmissions.find((item) => item.id === id);
};

// Get all submissions (for admin panel)
export const getAllSubmissions = (): InfluencerSubmission[] => {
  return [...influencerSubmissions];
};

// Mock brand list
export const getBrands = (): string[] => {
  return [
    "Nike",
    "Adidas",
    "Puma",
    "Under Armour",
    "Fashion Nova",
    "Pretty Little Thing",
    "Gymshark",
    "Boohoo",
    "Forever 21",
    "ASOS",
    "Other"
  ];
};
