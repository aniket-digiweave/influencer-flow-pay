
import { supabase } from '@/integrations/supabase/client';

// Generate unique ID
export const generatePaymentId = (): string => {
  const prefix = "PAY";
  const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
  return `${prefix}-${randomPart}`;
};

// Get all brands
export const getBrands = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('brand_owner_map')
      .select('brand_name')
      .order('brand_name');
      
    if (error) throw error;
    return data?.map(item => item.brand_name) || [];
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
};

// Get influencers by brand name
export const getInfluencersByBrand = async (brandName: string): Promise<any[]> => {
  if (!brandName) return [];
  
  try {
    const { data, error } = await supabase
      .from('influencer_master_list')
      .select('*')
      .eq('brand_name', brandName);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching influencers by brand:', error);
    return [];
  }
};

// Get owner email by brand name
export const getOwnerEmailByBrand = async (brandName: string): Promise<string | null> => {
  if (!brandName) return null;
  
  try {
    const { data, error } = await supabase
      .from('brand_owner_map')
      .select('owner_email')
      .eq('brand_name', brandName)
      .single();
      
    if (error) throw error;
    return data?.owner_email || null;
  } catch (error) {
    console.error('Error fetching owner email:', error);
    return null;
  }
};

// Submit influencer form
export const submitInfluencerForm = async (formData: any): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    // Generate payment ID
    const paymentId = generatePaymentId();
    
    // Get owner email for the selected brand
    const ownerEmail = await getOwnerEmailByBrand(formData.brand);
    
    if (!ownerEmail) {
      throw new Error('Brand owner email not found');
    }
    
    // Handle UPI QR upload if applicable
    let upiQrUrl = null;
    if (formData.paymentMethod === 'upi' && formData.upiQrCode) {
      const fileExt = formData.upiQrCode.name.split('.').pop();
      const fileName = `${paymentId}_upi_qr.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-qrs')
        .upload(fileName, formData.upiQrCode);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-qrs')
        .getPublicUrl(fileName);
        
      upiQrUrl = publicUrl;
    }
    
    // Create payment record
    const { data, error } = await supabase
      .from('influencer_submissions')
      .insert({
        brand: formData.brand,
        influencer_name: formData.influencerName,
        instagram_post: formData.instagramLink,
        email: formData.email,
        payment_method: formData.paymentMethod,
        upi_qr: upiQrUrl,
        bank_account_name: formData.paymentMethod === 'bank' ? formData.accountHolderName : null,
        bank_account_no: formData.paymentMethod === 'bank' ? formData.accountNumber : null,
        ifsc: formData.paymentMethod === 'bank' ? formData.ifscCode : null,
        bank_name: formData.paymentMethod === 'bank' ? formData.bankName : null,
        amount: formData.amount,
        payment_status: 'Pending',
        payment_id: paymentId,
        owner_email: ownerEmail
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Send data to webhook
    try {
      await fetch("https://aniketgore.app.n8n.cloud/webhook-test/b3eb0773-bf61-4e3f-b48e-446d7393d0d4", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: formData.brand,
          influencer_name: formData.influencerName,
          instagram_post: formData.instagramLink,
          email: formData.email,
          payment_method: formData.paymentMethod,
          amount: formData.amount,
          payment_id: paymentId,
          owner_email: ownerEmail,
          timestamp: new Date().toISOString()
        }),
        mode: "no-cors"
      });
    } catch (webhookError) {
      console.error("Error sending data to webhook:", webhookError);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting influencer form:', error);
    return { success: false, error };
  }
};

// Submit client payment
export const submitClientPayment = async (formData: any): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    // Find the matching submission
    const { data: submission, error: submissionError } = await supabase
      .from('influencer_submissions')
      .select('*')
      .eq('payment_id', formData.paymentId)
      .single();
      
    if (submissionError) throw submissionError;
    
    if (!submission) {
      return { 
        success: false, 
        error: { message: 'Payment ID not found. Please check and try again.' } 
      };
    }
    
    // Handle screenshot upload
    let screenshotUrl = null;
    if (formData.screenshot) {
      const fileExt = formData.screenshot.name.split('.').pop();
      const fileName = `${formData.paymentId}_screenshot.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, formData.screenshot);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);
        
      screenshotUrl = publicUrl;
    }
    
    // Create payment confirmation record
    const { data, error } = await supabase
      .from('client_payments')
      .insert({
        payment_id: formData.paymentId,
        screenshot_url: screenshotUrl,
        matched_submission_id: submission.id,
        status: 'Confirmed',
        sent_to_influencer: false
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Update submission payment status
    const { error: updateError } = await supabase
      .from('influencer_submissions')
      .update({ payment_status: 'Paid' })
      .eq('id', submission.id);
      
    if (updateError) throw updateError;
    
    // Send data to webhook
    try {
      await fetch("https://aniketgore.app.n8n.cloud/webhook/payment-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_id: formData.paymentId,
          screenshot_url: screenshotUrl,
          influencer_email: submission.email,
          brand: submission.brand,
          influencer_name: submission.influencer_name,
          amount: submission.amount,
          timestamp: new Date().toISOString()
        }),
        mode: "no-cors"
      });
    } catch (webhookError) {
      console.error("Error sending data to webhook:", webhookError);
    }
    
    return { 
      success: true, 
      data: {
        ...data,
        submission
      }
    };
  } catch (error) {
    console.error('Error submitting client payment:', error);
    return { success: false, error };
  }
};
